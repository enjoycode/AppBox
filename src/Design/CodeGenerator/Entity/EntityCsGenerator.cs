using System.Text;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxDesign;

/// <summary>
/// 生成实体模型的运行时代码，用于服务模型或桌面端的视图模型
/// </summary>
internal static class EntityCsGenerator
{
    internal static string GenRxEntityCode(ModelNode modelNode)
    {
        var appName = modelNode.AppNode.Model.Name;
        var model = (EntityModel)modelNode.Model;

        var sb = StringBuilderCache.Acquire();
        sb.Append("using System;\n");
        sb.Append("using System.Collections.Generic;\n");
        sb.Append("using System.Threading.Tasks;\n");
        sb.Append("using AppBoxCore;\n\n");
        sb.Append($"namespace {appName}.Entities;\n");

        sb.Append($"public sealed class Rx{model.Name}");
        sb.Append("\n{\n"); //class start

        // Target Property
        sb.Append($"public {model.Name} Target {{get;set;}}\n");

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    GenRxEntityFieldMember((EntityFieldModel)member, sb);
                    break;
                // TODO:
                // case EntityMemberType.EntityRef:
                //     break;
                // case EntityMemberType.EntitySet:
                //     break;
                // default:
                //     throw new NotImplementedException(member.Type.ToString());
            }
        }

        sb.Append("}\n"); //class end
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    private static void GenRxEntityFieldMember(EntityFieldModel field, StringBuilder sb)
    {
        sb.Append("public State<");
        sb.Append(GetEntityFieldTypeString(field));
        sb.Append($"> {field.Name} => throw new Exception();\n");
    }

    internal static string GenRuntimeCode(ModelNode modelNode)
    {
        var appName = modelNode.AppNode.Model.Name;
        var model = (EntityModel)modelNode.Model;

        var sb = StringBuilderCache.Acquire();
        sb.Append("using System;\n");
        sb.Append("using System.Collections.Generic;\n");
        sb.Append("using System.Threading.Tasks;\n");
        sb.Append("using AppBoxCore;\n\n");
        sb.Append($"namespace {appName}.Entities;\n");

        sb.Append($"public sealed class {model.Name} : {GetEntityBaseClass(model)}");
        sb.Append("\n{\n"); //class start

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    GenEntityFieldMember((EntityFieldModel)member, sb);
                    break;
                case EntityMemberType.EntityFieldTracker:
                    GenFieldTrackerMember((FieldTrackerModel)member, sb);
                    break;
                case EntityMemberType.EntityRef:
                    GenEntityRefMember((EntityRefModel)member, sb, modelNode.DesignTree!);
                    break;
                case EntityMemberType.EntitySet:
                    GenEntitySetMember((EntitySetModel)member, sb, modelNode.DesignTree!);
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }
        
        // override AcceptTrackerChanges()
        GenOverrideAcceptTrackerChanges(model, sb);

        // override ModelId
        sb.Append($"public const long MODELID={model.Id.Value}L;\n");
        sb.Append("public override ModelId ModelId => MODELID;\n");

        // override AllMembers
        sb.Append("private static readonly short[] MemberIds={");
        for (var i = 0; i < model.Members.Count; i++)
        {
            if (i != 0) sb.Append(',');
            sb.Append(model.Members[i].MemberId.ToString());
        }

        sb.Append("};\nprotected override short[] AllMembers => MemberIds;\n");

        // override WriteMember & ReadMember
        GenOverrideWriteMember(model, sb);
        GenOverrideReadMember(model, sb, modelNode.DesignTree!);

        // 存储方法Insert/Update/Delete/Fetch
        GenStoreCRUDMethods(model, sb);

        sb.Append("}\n"); //class end
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    private static void GenEntityFieldMember(EntityFieldModel field, StringBuilder sb)
    {
        var typeString = GetEntityFieldTypeString(field);
        if (field.Owner.DataStoreKind == DataStoreKind.None)
        {
            sb.Append($"\tpublic {typeString} {field.Name} {{get; set;}}\n");
        }
        else
        {
            sb.Append($"\tprivate {typeString} _{field.Name};\n");
            sb.Append($"\tpublic {typeString} {field.Name}\n");
            sb.Append("\t{\n"); //prop start
            sb.Append($"\t\tget => _{field.Name};\n");

            sb.Append("\t\tset\n");
            sb.Append("\t\t{\n"); //prop set start

            //判断是主键且不可修改且非新建状态抛异常
            var isPK = field.IsPrimaryKey;
            var isChangeablePK = field.IsChangeablePrimaryKey;
            if (isPK && !isChangeablePK)
            {
                sb.Append(
                    "\t\t\tif (PersistentState != PersistentState.Detached) throw new NotSupportedException(\"不可修改的主键字段\");\n");
            }

            sb.Append($"\t\t\tif (_{field.Name} == value) return;\n");

            //如果存在相应的跟踪值成员，则先跟踪旧值
            var tracker = field.Owner.Members.SingleOrDefault(m =>
                m is FieldTrackerModel tracker && tracker.TargetMemberId == field.MemberId);
            if (tracker != null)
                sb.Append($"\t\t\t{tracker.Name} = _{field.Name};\n");

            sb.Append($"\t\t\t_{field.Name} = value;\n");
            sb.Append($"\t\t\tOnPropertyChanged({field.MemberId});\n");
            sb.Append("\t\t}\n"); //prop set end

            sb.Append("\t}\n"); //prop end
        }
    }

    private static void GenFieldTrackerMember(FieldTrackerModel tracker, StringBuilder sb)
    {
        var target = tracker.Target;
        var targetTypeString = GetEntityFieldTypeString(target);
        var typeString = targetTypeString;
        if (!target.AllowNull) typeString = targetTypeString + "?"; //始终允许null

        sb.Append($"\tprivate {typeString} _{tracker.Name};\n");
        sb.Append($"\tpublic {targetTypeString} {tracker.Name}\n");
        sb.Append("\t{\n"); //prop start
        sb.Append($"\t\tget => _{tracker.Name} ?? _{target.Name};\n");

        sb.Append("\t\tprivate set\n"); //不允许公开访问
        sb.Append("\t\t{\n"); //prop set start

        //判断新建状态直接退出
        sb.Append("\t\t\tif (PersistentState == PersistentState.Detached) return;\n");
        //判断是否已存在旧值
        sb.Append($"\t\t\tif (_{tracker.Name} != null) return;\n");
        sb.Append($"\t\t\t_{tracker.Name} = value;\n");

        sb.Append("\t\t}\n"); //prop set end
        sb.Append("\t}\n"); //prop end
    }

    private static void GenEntityRefMember(EntityRefModel entityRef, StringBuilder sb, DesignTree tree)
    {
        var refModelNode = tree.FindModelNode(entityRef.RefModelIds[0])!;
        var typeString = entityRef.IsAggregationRef
            ? GetEntityBaseClass(entityRef.Owner)
            : $"{refModelNode.AppNode.Model.Name}.Entities.{refModelNode.Model.Name}";

        var fieldName = entityRef.Name;
        sb.Append($"\tprivate {typeString}? _{fieldName};\n");
        sb.Append($"\tpublic {typeString}? {fieldName}\n");
        sb.Append("\t{\n"); //prop start
        sb.Append($"\t\tget => _{fieldName};\n");

        sb.Append("\t\tset\n");
        sb.Append("\t\t{\n"); //prop set start
        sb.Append($"\t\t\t_{fieldName} = value");
        if (!entityRef.AllowNull) sb.Append(" ?? throw new ArgumentNullException()");
        sb.Append(";\n");

        //同步设置聚合引用类型成员的值及外键成员的值
        if (entityRef.Owner.DataStoreKind == DataStoreKind.Sql)
        {
            if (entityRef.IsAggregationRef)
            {
                var typeMember = entityRef.Owner.GetMember(entityRef.TypeMemberId)!;
                if (entityRef.AllowNull)
                {
                    sb.Append("\t\t\tif (value == null) {\n");
                    sb.Append($"\t\t\t\t{typeMember.Name} = null;\n");
                    for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                    {
                        var fkMember = (EntityFieldModel)entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                        if (fkMember.IsPrimaryKey) continue; //暂OrgUnit特例
                        sb.Append($"\t\t\t\t{fkMember.Name} = null;\n");
                    }

                    sb.Append("\t\t\t} else {\n");
                }

                sb.Append("\t\t\tswitch (value) {\n");
                foreach (var refModelId in entityRef.RefModelIds)
                {
                    refModelNode = tree.FindModelNode(refModelId)!;
                    var refModelAppName = refModelNode.AppNode.Model.Name;
                    var refModel = (EntityModel)refModelNode.Model;
                    var refPks = refModel.SqlStoreOptions!.PrimaryKeys;

                    sb.Append($"\t\t\tcase {refModelAppName}.Entities.{refModel.Name} _{refModel.Name}:\n");
                    sb.Append($"\t\t\t\t{typeMember.Name} = {refModel.Id.Value.ToString()}L;\n");
                    for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                    {
                        var fkMember = (EntityFieldModel)entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                        if (fkMember.IsPrimaryKey) continue; //暂OrgUnit特例
                        var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                        sb.Append($"\t\t\t\t{fkMember.Name} = _{refModel.Name}.{pkMember.Name};\n");
                    }

                    sb.Append("\t\t\t\tbreak;\n");
                }

                sb.Append("\t\t\tdefault: throw new ArgumentException();\n");
                sb.Append("\t\t\t}\n"); //end switch (value)
                if (entityRef.AllowNull)
                    sb.Append("\t\t\t}\n"); //end if (value == null)
            }
            else
            {
                var refModel = (EntityModel)refModelNode.Model;
                var refPks = refModel.SqlStoreOptions!.PrimaryKeys;
                for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                {
                    var fkMember = entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                    var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                    sb.Append(entityRef.AllowNull
                        ? $"\t\t\t{fkMember.Name} = value?.{pkMember.Name};\n"
                        : $"\t\t\t{fkMember.Name} = value!.{pkMember.Name};\n");
                }
            }
        }
        else
        {
            throw new NotImplementedException("生成实体的EntityRef成员代码");
        }

        //TODO: DbEntity.OnPropertyChanged
        sb.Append("\t\t}\n"); //prop set end

        sb.Append("\t}\n"); //prop end
    }

    private static void GenEntitySetMember(EntitySetModel entitySet, StringBuilder sb, DesignTree tree)
    {
        var refNode = tree.FindModelNode(entitySet.RefModelId)!;
        var refModel = (EntityModel)refNode.Model;
        var typeString = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
        var fieldName = entitySet.Name;
        var refName = refModel.GetMember(entitySet.RefMemberId)!.Name;

        sb.Append($"\tprivate EntitySet<{typeString}>? _{fieldName};\n");
        sb.Append($"\tpublic EntitySet<{typeString}> {fieldName}\n");
        sb.Append("\t{\n"); //prop start
        sb.Append("\t\tget {\n");
        sb.Append(
            $"\t\t\t_{fieldName} ??= new EntitySet<{typeString}>((t,toNull) => t.{refName} = toNull ? null : this);\n");

        sb.Append($"\t\t\treturn _{fieldName};\n");
        sb.Append("\t\t}\n");

        sb.Append("\t}\n"); //prop end
    }

    private static void GenOverrideAcceptTrackerChanges(EntityModel model, StringBuilder sb)
    {
        var trackers = model.Members
            .Where(m => m.Type == EntityMemberType.EntityFieldTracker)
            .Cast<FieldTrackerModel>().ToArray();
        if(trackers.Length == 0) return;
        
        sb.Append("protected override void AcceptTrackerChanges(){\n");
        foreach (var tracker in trackers)
        {
            sb.Append($"\t_{tracker.Name} = null;\n");
        }
        sb.Append("}\n"); //end method
    }

    private static void GenOverrideWriteMember(EntityModel model, StringBuilder sb)
    {
        sb.Append("protected override void WriteMember<T>(short id, ref T ws, int flags){\n");
        sb.Append("\tswitch(id){\n");
        foreach (var member in model.Members)
        {
            sb.Append("\t\tcase ");
            sb.Append(member.MemberId);
            sb.Append(": ws.Write");
            sb.Append(EntityCodeGenUtils.GetEntityMemberWriteReadType(member));
            sb.Append("Member(id,");
            if (model.StoreOptions != null) sb.Append('_');
            sb.Append(member.Name);
            sb.Append(",flags);break;\n");
        }

        sb.Append(
            "\t\tdefault: throw new SerializationException(SerializationError.UnknownEntityMember,nameof(");
        sb.Append(model.Name);
        sb.Append("));\n");
        sb.Append("\t}\n"); //end switch
        sb.Append("}\n"); //end WriteMember
    }

    private static void GenOverrideReadMember(EntityModel model, StringBuilder sb, DesignTree tree)
    {
        sb.Append("protected override void ReadMember<T>(short id, ref T rs, int flags){\n");
        sb.Append("\tswitch(id){\n");
        foreach (var member in model.Members)
        {
            sb.Append("\t\tcase ");
            sb.Append(member.MemberId);
            sb.Append(':');
            if (member.Type != EntityMemberType.EntitySet)
            {
                if (model.StoreOptions != null) sb.Append('_');
                sb.Append(member.Name);
                sb.Append('=');
            }

            sb.Append("rs.Read");
            sb.Append(EntityCodeGenUtils.GetEntityMemberWriteReadType(member));
            sb.Append("Member");
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                case EntityMemberType.EntityFieldTracker:
                    sb.Append("(flags);break;\n");
                    break;
                case EntityMemberType.EntityRef:
                {
                    var entityRef = (EntityRefModel)member;
                    if (entityRef.IsAggregationRef)
                    {
                        var typeMember = model.GetMember(entityRef.TypeMemberId)!;
                        sb.Append($"<{GetEntityBaseClass(model)}>");
                        sb.Append($"(flags, () => _{typeMember.Name} switch {{\n");
                        foreach (var refModelId in entityRef.RefModelIds)
                        {
                            var refNode = tree.FindModelNode(refModelId)!;
                            var refModel = (EntityModel)refNode.Model;
                            var refModelName = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                            sb.Append($"\t\t\t{refModel.Id.ToString()}L => new {refModelName}(),\n");
                        }

                        sb.Append("\t\t\t_ => throw new Exception()\n");

                        sb.Append("\t\t\t});break;\n");
                    }
                    else
                    {
                        var refModelId = entityRef.RefModelIds[0];
                        var refNode = tree.FindModelNode(refModelId)!;
                        var refModel = (EntityModel)refNode.Model;
                        var refModelName = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                        sb.Append($"(flags, () => new {refModelName}());break;\n");
                    }

                    break;
                }
                case EntityMemberType.EntitySet:
                {
                    var entitySet = (EntitySetModel)member;
                    var refNode = tree.FindModelNode(entitySet.RefModelId)!;
                    var refModel = (EntityModel)refNode.Model;
                    var refModelName = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                    sb.Append($"(flags, {member.Name});break;\n");

                    break;
                }
                default: throw new NotImplementedException(member.Type.ToString());
            }
        }

        sb.Append("\t\tdefault: throw new SerializationException(SerializationError.UnknownEntityMember,nameof(");
        sb.Append(model.Name);
        sb.Append("));\n");
        sb.Append("\t}\n"); //end switch
        sb.Append("}\n"); //end ReadMember
    }

    /// <summary>
    /// 生成服务端运行时的存储方法
    /// </summary>
    private static void GenStoreCRUDMethods(EntityModel model, StringBuilder sb)
    {
        if (model.SqlStoreOptions == null) return;

        sb.Append("#if __HOSTRUNTIME__\n");
        // GetSqlStore
        sb.Append("public SqlStore GetSqlStore() =>");
        GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
        sb.Append(";\n\n");

        // InsertAsync
        sb.Append("public Task<int> InsertAsync(System.Data.Common.DbTransaction? txn=null) =>\n");
        GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
        sb.Append(".InsertAsync(this,txn);\n\n");

        // UpdateAsync
        sb.Append("public Task<int> UpdateAsync(System.Data.Common.DbTransaction? txn=null) =>\n");
        GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
        sb.Append(".UpdateAsync(this,txn);\n\n");

        // DeleteAsync
        sb.Append("public Task<int> DeleteAsync(System.Data.Common.DbTransaction? txn=null) =>\n");
        GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
        sb.Append(".DeleteAsync(this,txn);\n\n");

        // FetchAsync
        GenStoreFetchMethod(model, sb, true);

        sb.Append("#else\n");
        //生成internal版本的FetchAsync方法,防止前端工程看见此方法
        GenStoreFetchMethod(model, sb, false);
        sb.Append("#endif\n");
    }

    private static void GenStoreFetchMethod(EntityModel model, StringBuilder sb, bool forRuntime)
    {
        if (!model.SqlStoreOptions!.HasPrimaryKeys) return;

        var pks = model.SqlStoreOptions.PrimaryKeys;

        sb.Append(forRuntime ? "public" : "internal");
        sb.Append($" static Task<{model.Name}?> FetchAsync(");
        for (var i = 0; i < pks.Length; i++)
        {
            if (i != 0) sb.Append(',');
            var dfm = (EntityFieldModel)model.GetMember(pks[i].MemberId)!;
            sb.Append(GetEntityFieldTypeString(dfm));
            sb.Append(' ');
            sb.Append(CodeUtil.ToLowCamelCase(dfm.Name));
        }

        sb.Append(", System.Data.Common.DbTransaction? txn=null) => \n");

        if (forRuntime)
        {
            GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
            sb.Append(".FetchAsync(new ");
            sb.Append(model.Name);
            sb.Append('{');
            for (var i = 0; i < pks.Length; i++)
            {
                if (i != 0) sb.Append(',');
                var dfm = (EntityFieldModel)model.GetMember(pks[i].MemberId)!;
                sb.Append($"{dfm.Name} = {CodeUtil.ToLowCamelCase(dfm.Name)}");
            }

            sb.Append("}, txn);\n");
        }
        else
        {
            sb.Append("\tthrow new Exception();\n");
        }
    }

    /// <summary>
    /// 根据实体模型的存储配置获取继承的基类
    /// </summary>
    private static string GetEntityBaseClass(EntityModel model)
    {
        return model.DataStoreKind switch
        {
            DataStoreKind.None => nameof(Entity),
            DataStoreKind.Sql => nameof(SqlEntity),
            _ => throw new NotImplementedException(model.DataStoreKind.ToString())
        };
    }

    private static string GetEntityFieldTypeString(EntityFieldModel field)
    {
        var typeString = field.FieldType switch
        {
            EntityFieldType.String => "string",
            EntityFieldType.Bool => "bool",
            EntityFieldType.Byte => "byte",
            EntityFieldType.Short => "short",
            EntityFieldType.Int => "int",
            EntityFieldType.Long => "long",
            EntityFieldType.Float => "float",
            EntityFieldType.Double => "double",
            EntityFieldType.DateTime => "DateTime",
            EntityFieldType.Decimal => "decimal",
            EntityFieldType.Guid => "Guid",
            EntityFieldType.Binary => "byte[]",
            _ => throw new NotImplementedException(field.FieldType.ToString())
        };
        return field.AllowNull ? typeString + '?' : typeString;
    }

    private static void GenSqlStoreGetMethod(SqlStoreOptions sqlStoreOptions, StringBuilder sb)
    {
        var isDefaultStore = sqlStoreOptions.StoreModelId == SqlStore.DefaultSqlStoreId;
        if (isDefaultStore)
        {
            sb.Append("\tAppBoxStore.SqlStore.Default");
        }
        else
        {
            sb.Append("\tAppBoxStore.SqlStore.Get(");
            sb.Append(sqlStoreOptions.StoreModelId);
            sb.Append(')');
        }
    }
}