using System.Text;
using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 生成实体模型的Js代码
/// </summary>
public static class EntityJsGenerator
{
    public static string GenWebCode(EntityModel model, IModelContainer ctx, bool forPreview
#if DEBUG
        , bool forViteDev = false
#endif
    )
    {
        var sb = StringBuilderCache.Acquire();

#if DEBUG
        if (forPreview && forViteDev)
            sb.Append("import * as AppBoxCore from '/src/AppBoxCore/index.ts'\n\n");
        else
            sb.Append("import * as AppBoxCore from '/AppBoxCore.js'\n\n");
#else
            sb.Append("import * as AppBoxCore from '/AppBoxCore.js'\n\n");
#endif

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
                case EntityMemberType.EntityRef:
                    GenWebEntityRefMember((EntityRefModel)member, ctx, sb);
                    break;
                case EntityMemberType.EntitySet:
                    GenWebEntitySetMember((EntitySetModel)member, ctx, sb);
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }

        // override ModelId
        sb.Append("\n\n\tstatic get MODELID() {return ");
        sb.Append(model.Id.Value.ToString());
        sb.Append("n;}");

        sb.Append("\n\tget ModelId() {return ");
        sb.Append(model.Id.Value.ToString());
        sb.Append("n;}\n");

        // override ReadFrom()
        sb.Append("\n\tReadFrom(rs){\n");
        sb.Append("\t\tsuper.ReadFrom(rs);\n");

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
                    sb.Append("this._");
                    sb.Append(member.Name);
                    sb.Append("=rs.Read");
                    sb.Append(EntityCodeGenUtils.GetEntityMemberWriteReadType(member));
                    sb.Append("();break;\n");
                    break;
                case EntityMemberType.EntityRef:
                    sb.Append("this._");
                    sb.Append(member.Name);
                    sb.Append("=rs.Deserialize();break;\n");
                    break;
                case EntityMemberType.EntitySet:
                    sb.Append("this.");
                    sb.Append(member.Name);
                    sb.Append(".ReadFrom(rs);");
                    sb.Append("break;\n");
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
        sb.Append("\t\tsuper.WriteTo(ws);\n");

        foreach (var member in model.Members)
        {
            sb.Append("\t\t");
            var withIfNullCheck = false;
            if (!(member.Type == EntityMemberType.EntityField && !member.AllowNull))
            {
                withIfNullCheck = true;
                sb.Append("if (this._");
                sb.Append(member.Name);
                sb.Append(" != null");
                if (member.Type == EntityMemberType.EntityRef || member.Type == EntityMemberType.EntitySet)
                    sb.Append(" && !this._ignoreSerializeNavigateMembers");
                sb.Append("){ ");
            }

            switch (member.Type)
            {
                case EntityMemberType.EntityField:
                    sb.Append("ws.WriteShort(");
                    sb.Append(member.MemberId.ToString());
                    sb.Append("); ");

                    sb.Append("ws.Write");
                    sb.Append(EntityCodeGenUtils.GetEntityMemberWriteReadType(member));
                    sb.Append("(this._");
                    sb.Append(member.Name);
                    sb.Append(");");
                    break;
                case EntityMemberType.EntityRef:
                    sb.Append("ws.WriteShort(");
                    sb.Append(member.MemberId.ToString());
                    sb.Append("); ");

                    sb.Append("ws.Serialize(this._");
                    sb.Append(member.Name);
                    sb.Append("); ");
                    break;
                case EntityMemberType.EntitySet:
                    sb.Append("ws.WriteShort(");
                    sb.Append(member.MemberId.ToString());
                    sb.Append("); ");

                    sb.Append("this._");
                    sb.Append(member.Name);
                    sb.Append(".WriteTo(ws);");
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }

            if (withIfNullCheck) sb.Append(" }\n");
            else sb.Append('\n');
        }

        sb.Append("\t\tws.WriteShort(0);\n");
        sb.Append("\t\tthis._ignoreSerializeNavigateMembers = false;\n");
        sb.Append("\t}\n"); //end WriteTo()

        sb.Append("}\n"); //class end
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    private static void GenWebEntityFieldMember(EntityFieldModel field, StringBuilder sb)
    {
        //TODO:默认值生成
        sb.Append($"\t_{field.Name}; ");
        sb.Append($"get {field.Name}() {{return this._{field.Name}}} ");
        sb.Append($"set {field.Name}(value) {{");
        //TODO: check equals
        sb.Append($"this._{field.Name}=value;");
        sb.Append($"this.OnPropertyChanged({field.MemberId});");
        sb.Append("}\n");
    }

    private static void GenWebEntityRefMember(EntityRefModel entityRef, IModelContainer ctx, StringBuilder sb)
    {
        var name = entityRef.Name;
        sb.Append($"\t_{name}; ");
        sb.Append($"get {name}() {{return this._{name}}} ");
        sb.Append($"set {name}(value) {{");
        //TODO: check allow null and value == null
        sb.Append($"this._{name}=value;");
        //同步设置聚合引用类型成员的值及外键成员的值
        if (entityRef.Owner.DataStoreKind == DataStoreKind.Sql)
        {
            if (entityRef.IsAggregationRef)
            {
                var typeMember = entityRef.Owner.GetMember(entityRef.TypeMemberId)!;
                if (entityRef.AllowNull)
                {
                    sb.Append("if (value == null) {");
                    sb.Append($"{typeMember.Name} = null;");
                    for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                    {
                        var fkMember = (EntityFieldModel)entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                        if (fkMember.IsPrimaryKey) continue; //暂OrgUnit特例
                        sb.Append($"{fkMember.Name} = null;");
                    }

                    sb.Append("} else {");
                }

                sb.Append("switch (value.ModelId) {");
                foreach (var refModelId in entityRef.RefModelIds)
                {
                    var refModel = ctx.GetEntityModel(refModelId);
                    var refPks = refModel.SqlStoreOptions!.PrimaryKeys;

                    sb.Append($"case {refModelId}n :");
                    sb.Append($"this.{typeMember.Name} = {refModelId.ToString()}n;");
                    for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                    {
                        var fkMember = (EntityFieldModel)entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                        if (fkMember.IsPrimaryKey) continue; //暂OrgUnit特例
                        var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                        sb.Append($"this.{fkMember.Name} = _{refModel.Name}.{pkMember.Name};");
                    }

                    sb.Append("break;");
                }

                sb.Append("default: throw new ArgumentException();");
                sb.Append('}'); //end switch
                if (entityRef.AllowNull)
                    sb.Append('}'); //end if (value == null)
            }
            else
            {
                var refModel = ctx.GetEntityModel(entityRef.RefModelIds[0]);
                var refPks = refModel.SqlStoreOptions!.PrimaryKeys;
                for (var i = 0; i < entityRef.FKMemberIds.Length; i++)
                {
                    var fkMember = entityRef.Owner.GetMember(entityRef.FKMemberIds[i])!;
                    var pkMember = refModel.GetMember(refPks[i].MemberId)!;
                    sb.Append(entityRef.AllowNull
                        ? $"this.{fkMember.Name} = value?.{pkMember.Name};"
                        : $"this.{fkMember.Name} = value.{pkMember.Name};");
                }
            }
        }
        else
        {
            throw new NotImplementedException("生成实体的EntityRef成员代码");
        }

        sb.Append($"this.OnPropertyChanged({entityRef.MemberId});");
        sb.Append("}\n");
    }

    private static void GenWebEntitySetMember(EntitySetModel entitySet, IModelContainer ctx, StringBuilder sb)
    {
        var name = entitySet.Name;
        var refModel = ctx.GetEntityModel(entitySet.RefModelId);
        var refName = refModel.GetMember(entitySet.RefMemberId)!.Name;

        sb.Append($"\t_{name}; ");
        //注意构造EntitySet时暂不需要生成实体工厂委托
        sb.Append(
            $"get {name}() {{this._{name} ??= new AppBoxCore.EntitySet((t,toNull) => t.{refName} = toNull ? null : this, null); return this._{name};}}");
    }
}