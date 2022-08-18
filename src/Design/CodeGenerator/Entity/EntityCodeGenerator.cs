using System.Text;
using AppBoxCore;
using AppBoxStore;

namespace AppBoxDesign;

internal static class EntityCodeGenerator
{
    /// <summary>
    /// 生成实体模型的Web代码
    /// </summary>
    internal static string GenEntityWebCode(EntityModel model, string appName, bool forPreview)
    {
        var sb = StringBuilderCache.Acquire();
        if (forPreview)
#if DEBUG
            sb.Append("import * as AppBoxCore from '/src/AppBoxCore/index.ts'\n\n");
#else
            sb.Append("import * as AppBoxCore from '/AppBoxCore.js'\n\n");
#endif
        else
            throw new NotImplementedException("Not for preview");

        sb.Append($"export class {model.Name}");
        //根据存储配置继承不同的基类
        sb.Append(model.DataStoreKind == DataStoreKind.None
            ? " extends AppBoxCore.Entity"
            : " extends AppBoxCore.DbEntity");

        sb.Append("\n{\n"); //class start

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    GenWebEntityFieldMember((EntityFieldModel)member, sb);
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }

        // override ModelId
        sb.Append("\n\tget ModelId() {return ");
        sb.Append(model.Id.Value.ToString());
        sb.Append("n;}\n");

        // override ReadFrom()
        sb.Append("\n\tReadFrom(rs){\n");
        sb.Append("\t\twhile(true){\n");
        sb.Append("\t\t\tlet mid=rs.ReadShort();\n");
        sb.Append("\t\t\tif(mid===0) break;\n");
        sb.Append("\t\t\tswitch(mid){\n");

        foreach (var member in model.Members)
        {
            sb.Append("\t\t\t\tcase ");
            sb.Append(member.MemberId.ToString());
            sb.Append(':');
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    sb.Append("this.");
                    if (model.DataStoreKind != DataStoreKind.None)
                        sb.Append('_');
                    sb.Append(member.Name);
                    sb.Append("=rs.Read");
                    sb.Append(GetEntityMemberWriteReadType(member));
                    sb.Append("();break;\n");
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }

        sb.Append("\t\t\t\tdefault: throw new Error();\n");

        sb.Append("\t\t\t}\n"); //end switch
        sb.Append("\t\t}\n"); //end while
        sb.Append("\t}\n"); //end ReadFrom()

        // override WriteTo()
        sb.Append("\n\tWriteTo(ws){\n");
        foreach (var member in model.Members)
        {
            sb.Append("\t\t");
            if (member.AllowNull)
            {
                sb.Append("if (this.");
                if (model.DataStoreKind != DataStoreKind.None)
                    sb.Append('_');
                sb.Append(member.Name);
                sb.Append(" != null){ ");
            }

            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    sb.Append("ws.WriteShort(");
                    sb.Append(member.MemberId.ToString());
                    sb.Append("); ");

                    sb.Append("ws.Write");
                    sb.Append(GetEntityMemberWriteReadType(member));
                    sb.Append("(this.");
                    if (model.DataStoreKind != DataStoreKind.None)
                        sb.Append('_');
                    sb.Append(member.Name);
                    sb.Append(");");
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }

            if (member.AllowNull) sb.Append(" }\n");
            else sb.Append('\n');
        }

        sb.Append("\t\tws.WriteShort(0);\n");
        sb.Append("\t}\n"); //end WriteTo()

        sb.Append("}\n"); //class end
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    private static void GenWebEntityFieldMember(EntityFieldModel field, StringBuilder sb)
    {
        //TODO:默认值生成
        if (field.Owner.DataStoreKind == DataStoreKind.None)
        {
            sb.Append($"\t{field.Name};\n");
        }
        else
        {
            sb.Append($"\t_{field.Name}; ");
            sb.Append($"get {field.Name}() {{return this._{field.Name}}} ");
            sb.Append($"set {field.Name}(value) {{");
            //TODO: check equals and OnPropertyChanged
            sb.Append($"this._{field.Name}=value;");
            sb.Append("}\n");
        }
    }

    /// <summary>
    /// 生成实体模型的运行时代码
    /// </summary>
    internal static string GenEntityRuntimeCode(ModelNode modelNode)
    {
        var appName = modelNode.AppNode.Model.Name;
        var model = (EntityModel)modelNode.Model;

        var sb = StringBuilderCache.Acquire();
        sb.Append("using System;\n");
        sb.Append("using System.Collections.Generic;\n");
        sb.Append("using System.Threading.Tasks;\n");
        sb.Append("using AppBoxCore;\n\n");
        sb.Append($"namespace {appName}.Entities;\n");

        sb.Append($"[EntityModelIdAttribute({model.Id.Value}L)]\n");
        sb.Append($"public sealed class {model.Name} : {GetEntityBaseClass(model)}");
        sb.Append("\n{\n"); //class start

        //构造(仅Sql存储且具备主键)
        GenEntityCtor(model, sb);

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    GenEntityFieldMember((EntityFieldModel)member, sb);
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

        // override ModelId
        long modelIdValue = model.Id;
        sb.Append("private static readonly ModelId MODELID=");
        sb.Append(modelIdValue.ToString());
        sb.Append("L;\npublic override ModelId ModelId => MODELID;\n");

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

    /// <summary>
    /// 生成实体构造(仅Sql存储且具备主键)
    /// </summary>
    private static void GenEntityCtor(EntityModel model, StringBuilder sb)
    {
        if (model.SqlStoreOptions == null || !model.SqlStoreOptions.HasPrimaryKeys) return;

        var pks = model.SqlStoreOptions.PrimaryKeys;

        sb.Append("#if __RUNTIME__\n");
        sb.Append("\tpublic \n");
        sb.Append("#else\n");
        sb.Append("\tinternal \n");
        sb.Append("#endif\n\t");
        sb.Append(model.Name);
        sb.Append("(){}\n\n");

        sb.Append("\tpublic ");
        sb.Append(model.Name);
        sb.Append('(');
        for (var i = 0; i < pks.Length; i++)
        {
            if (i != 0) sb.Append(',');
            var dfm = (EntityFieldModel)model.GetMember(pks[i].MemberId)!;
            sb.Append(GetEntityFieldTypeString(dfm));
            sb.Append(' ');
            sb.Append(CodeUtil.ToLowCamelCase(dfm.Name));
        }

        sb.Append("){\n");
        foreach (var pk in pks)
        {
            sb.Append("\t\t");
            var dfm = (EntityFieldModel)model.GetMember(pk.MemberId)!;
            sb.Append('_');
            sb.Append(dfm.Name);
            sb.Append('=');
            sb.Append(CodeUtil.ToLowCamelCase(dfm.Name));
            sb.Append(";\n");
        }

        sb.Append("\t}\n");
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

            if (!field.IsPrimaryKey)
            {
                sb.Append("\t\tset\n");
                sb.Append("\t\t{\n"); //prop set start
                sb.Append($"\t\t\tif (_{field.Name} == value) return;\n");
                sb.Append($"\t\t\t_{field.Name} = value;\n");
                //TODO: DbEntity.OnPropertyChanged
                sb.Append("\t\t}\n"); //prop set end
            }

            sb.Append("\t}\n"); //prop end
        }
    }

    private static void GenEntityRefMember(EntityRefModel entityRef, StringBuilder sb,
        DesignTree tree)
    {
        var refModelNode = tree.FindModelNode(ModelType.Entity, entityRef.RefModelIds[0])!;
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

        //同步设置聚合引用类型的成员的值及外键成员的值
        if (entityRef.Owner.DataStoreKind == DataStoreKind.Sql)
        {
            if (entityRef.IsAggregationRef)
            {
                var typeMember = entityRef.Owner.GetMember(entityRef.TypeMemberId)!;
                sb.Append("\t\t\tswitch (value) {\n");
                foreach (var refModelId in entityRef.RefModelIds)
                {
                    refModelNode = tree.FindModelNode(ModelType.Entity, refModelId)!;
                    var refModel = (EntityModel)refModelNode.Model;
                    var refPks = refModel.SqlStoreOptions!.PrimaryKeys;

                    sb.Append(
                        $"\t\t\tcase {refModelNode.AppNode.Model.Name}.Entities.{refModel.Name} _{refModel.Name}:\n");
                    sb.Append($"\t\t\t\t{typeMember.Name} = {refModel.Id.ToString()}L;\n");
                    for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                    {
                        var fkMember =
                            (EntityFieldModel)entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                        if (fkMember.IsPrimaryKey) continue; //TODO:暂OrgUnit特例
                        var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                        sb.Append(
                            $"\t\t\t\t{fkMember.Name} = _{refModel.Name}.{pkMember.Name};\n");
                    }

                    sb.Append("\t\t\t\tbreak;\n");
                }

                sb.Append("\t\t\tdefault: throw new ArgumentException();\n");
                sb.Append("\t\t\t}\n");
            }
            else
            {
                var refModel = (EntityModel)refModelNode.Model;
                var refPks = refModel.SqlStoreOptions!.PrimaryKeys;
                for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                {
                    var fkMember = entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                    var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                    sb.Append($"\t\t\t{fkMember.Name} = value.{pkMember.Name};\n");
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

    private static void GenEntitySetMember(EntitySetModel entitySet, StringBuilder sb,
        DesignTree tree)
    {
        var refNode = tree.FindModelNode(ModelType.Entity, entitySet.RefModelId)!;
        var refModel = (EntityModel)refNode.Model;
        var typeString = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
        var fieldName = entitySet.Name;

        sb.Append($"\tprivate IList<{typeString}>? _{fieldName};\n");
        sb.Append($"\tpublic IList<{typeString}>? {fieldName}\n");
        sb.Append("\t{\n"); //prop start
        sb.Append("\t\tget {\n");
        sb.Append(
            $"\t\t\tif (_{fieldName} == null && PersistentState == PersistentState.Detached)\n");
        sb.Append($"\t\t\t\t_{fieldName} = new List<{typeString}>();\n");
        sb.Append($"\t\t\treturn _{fieldName};\n");
        sb.Append("\t\t}\n");

        sb.Append("\t}\n"); //prop end
    }

    private static void GenOverrideWriteMember(EntityModel model, StringBuilder sb)
    {
        sb.Append(
            "public override void WriteMember(short id, IEntityMemberWriter ws, int flags){\n");
        sb.Append("\tswitch(id){\n");
        foreach (var member in model.Members)
        {
            sb.Append("\t\tcase ");
            sb.Append(member.MemberId.ToString());
            sb.Append(": ws.Write");
            sb.Append(GetEntityMemberWriteReadType(member));
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
        sb.Append(
            "public override void ReadMember(short id, IEntityMemberReader rs, int flags){\n");
        sb.Append("\tswitch(id){\n");
        foreach (var member in model.Members)
        {
            sb.Append("\t\tcase ");
            sb.Append(member.MemberId.ToString());
            sb.Append(":");
            if (model.StoreOptions != null) sb.Append('_');
            sb.Append(member.Name);
            sb.Append("=rs.Read");
            sb.Append(GetEntityMemberWriteReadType(member));
            sb.Append("Member");
            switch (member.Type)
            {
                case EntityMemberType.EntityField:
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
                            var refNode = tree.FindModelNode(ModelType.Entity, refModelId)!;
                            var refModel = (EntityModel)refNode.Model;
                            var refModelName =
                                $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                            sb.Append(
                                $"\t\t\t{refModel.Id.ToString()}L => new {refModelName}(),\n");
                        }

                        sb.Append("\t\t\t_ => throw new Exception()\n");

                        sb.Append("\t\t\t});break;\n");
                    }
                    else
                    {
                        var refModelId = entityRef.RefModelIds[0];
                        var refNode = tree.FindModelNode(ModelType.Entity, refModelId)!;
                        var refModel = (EntityModel)refNode.Model;
                        var refModelName = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                        sb.Append($"(flags, () => new {refModelName}());break;\n");
                    }

                    break;
                }
                case EntityMemberType.EntitySet:
                {
                    var entitySet = (EntitySetModel)member;
                    var refNode = tree.FindModelNode(ModelType.Entity, entitySet.RefModelId)!;
                    var refModel = (EntityModel)refNode.Model;
                    var refModelName = $"{refNode.AppNode.Model.Name}.Entities.{refModel.Name}";
                    sb.Append($"(flags, () => new {refModelName}());break;\n");

                    break;
                }
                default: throw new NotImplementedException();
            }
        }

        sb.Append(
            "\t\tdefault: throw new SerializationException(SerializationError.UnknownEntityMember,nameof(");
        sb.Append(model.Name);
        sb.Append("));\n");
        sb.Append("\t}\n"); //end switch
        sb.Append("}\n"); //end ReadMember
    }

    private static void GenStoreCRUDMethods(EntityModel model, StringBuilder sb)
    {
        if (model.SqlStoreOptions == null) return;

        sb.Append("#if __HOSTRUNTIME__\n");
        sb.Append(
            "public Task<int> InsertAsync(System.Data.Common.DbTransaction? txn=null) =>\n");
        GenSqlStoreGetMethod(model.SqlStoreOptions, sb);
        sb.Append(".InsertAsync(");
        sb.Append("this,txn);\n");

        //TODO: others

        sb.Append("#endif\n");
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
            sb.Append(sqlStoreOptions.StoreModelId.ToString());
            sb.Append(')');
        }
    }

    private static string GetEntityMemberWriteReadType(EntityMemberModel member)
    {
        switch (member.Type)
        {
            case EntityMemberType.EntityField:
                var dfm = (EntityFieldModel)member;
                return dfm.FieldType == EntityFieldType.Enum ? "Int" : dfm.FieldType.ToString();
            case EntityMemberType.EntityRef: return "EntityRef";
            case EntityMemberType.EntitySet: return "EntitySet";
            default: throw new Exception();
        }
    }
}