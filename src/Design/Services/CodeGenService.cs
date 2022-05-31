using System.Text;
using AppBoxCore;

namespace AppBoxDesign;

internal static class CodeGenService
{
    /// <summary>
    /// 生成实体模型的Web代码
    /// </summary>
    internal static string GenEntityWebCode(EntityModel model, string appName, bool forPreview)
    {
        var sb = new StringBuilder(300);
        if (forPreview)
            sb.Append("import * as AppBoxCore from '/src/AppBoxCore/index.ts'\n\n");
        else
            throw new NotImplementedException();

        sb.Append($"export class {model.Name}");
        //根据存储配置继承不同的基类
        switch (model.DataStoreKind)
        {
            case DataStoreKind.None:
                sb.Append(" extends AppBoxCore.Entity");
                break;
            default: throw new NotImplementedException(model.DataStoreKind.ToString());
        }

        sb.Append("\n{\n"); //class start

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.DataField:
                    GenWebDataFieldMember((DataFieldModel)member, sb);
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }

        sb.Append("}\n"); //class end
        return sb.ToString();
    }

    private static void GenWebDataFieldMember(DataFieldModel field, StringBuilder sb)
    {
        if (field.Owner.DataStoreKind == DataStoreKind.None)
        {
            sb.Append($"\t{field.Name};\n");
        }
        else
        {
            throw new NotImplementedException();
        }
    }

    internal static string GenEntityDummyCode(EntityModel model, string appName,
        DesignTree designTree)
    {
        //TODO:未完
        var sb = new StringBuilder(300);
        sb.Append("using AppBoxCore;\n\n");
        sb.Append($"namespace {appName}.Entities;\n");

        sb.Append($"public class {model.Name}");
        //根据存储配置继承不同的基类
        switch (model.DataStoreKind)
        {
            case DataStoreKind.None:
                sb.Append(" : Entity");
                break;
            default: throw new NotImplementedException(model.DataStoreKind.ToString());
        }

        sb.Append("\n{\n"); //class start

        // 实体成员
        foreach (var member in model.Members)
        {
            switch (member.Type)
            {
                case EntityMemberType.DataField:
                    GenDataFieldMember((DataFieldModel)member, sb);
                    break;
                default:
                    throw new NotImplementedException(member.Type.ToString());
            }
        }

        sb.Append("}\n"); //class end
        return sb.ToString();
    }

    private static void GenDataFieldMember(DataFieldModel field, StringBuilder sb)
    {
        var typeString = GetDataFieldTypeString(field);
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
            sb.Append($"\t\t\tif (_{field.Name} == value) return;\n");
            sb.Append($"\t\t\t_{field.Name} = value;\n");
            //TODO: DbEntity.OnPropertyChanged
            sb.Append("\t\t}\n"); //prop set end
            sb.Append("\t}\n"); //prop end
        }
    }

    private static string GetDataFieldTypeString(DataFieldModel field)
    {
        return field.DataType switch
        {
            DataFieldType.String => field.AllowNull ? "string?" : "string",
            _ => throw new NotImplementedException(field.DataType.ToString())
        };
    }
}