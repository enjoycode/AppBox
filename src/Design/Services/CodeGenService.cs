using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal static class CodeGenService
{
    #region ====Entity====

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
            case DataStoreKind.Sql:
                sb.Append(" : SqlEntity");
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
                case EntityMemberType.EntityRef:
                    //TODO:
                    break;
                case EntityMemberType.EntitySet:
                    //TODO:
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
        var typeString = field.DataType switch
        {
            DataFieldType.String => "string",
            DataFieldType.Bool => "bool",
            DataFieldType.Byte => "byte",
            DataFieldType.Short => "short",
            DataFieldType.Int => "int",
            DataFieldType.Long => "long",
            DataFieldType.Float => "float",
            DataFieldType.Double => "double",
            DataFieldType.DateTime => "DateTime",
            DataFieldType.Decimal => "decimal",
            DataFieldType.Guid => "Guid",
            DataFieldType.Binary => "byte[]",
            _ => throw new NotImplementedException(field.DataType.ToString())
        };
        return field.AllowNull ? typeString + '?' : typeString;
    }

    #endregion

    #region ====Service====

    /// <summary>
    /// 生成服务模型的异步代理，用于服务间相互调用
    /// </summary>
    internal static async Task<string> GenServiceProxyCode(Document document, string appName,
        ServiceModel model)
    {
        var rootNode = await document.GetSyntaxRootAsync();

        //先导入using
        var sb = StringBuilderCache.Acquire();
        var usings = rootNode!.DescendantNodes().OfType<UsingDirectiveSyntax>().ToArray();
        foreach (var usingDirectiveSyntax in usings)
        {
            sb.Append(usingDirectiveSyntax);
        }

        sb.Append("namespace ");
        sb.AppendFormat("{0}.Services", appName);
        sb.Append("{ public static class ");
        sb.Append(model.Name);
        sb.Append("{ ");

        var methods = rootNode
            .DescendantNodes().OfType<ClassDeclarationSyntax>().First()
            .DescendantNodes().OfType<MethodDeclarationSyntax>().ToList();

        foreach (var method in methods)
        {
            var isPublic = method.Modifiers.Any(modifier => modifier.ValueText == "public");
            if (!isPublic) continue;

            // interceptor attribute
            sb.Append('[');
            sb.Append(TypeHelper.InvocationInterceptorAttribute);
            sb.Append("(\"");
            sb.Append(CallServiceInterceptor.Name);
            sb.Append("\")]\n");

            // method declaration
            sb.Append("public static ");
            var isReturnVoid = method.IsReturnVoid();
            var isReturnTask = !isReturnVoid && method.IsReturnTask();
            //非异步方法转换为异步
            if (isReturnVoid)
            {
                sb.Append("System.Threading.Tasks.Task");
            }
            else if (!isReturnTask)
            {
                sb.Append("System.Threading.Tasks.Task<");
                sb.Append(method.ReturnType);
                sb.Append('>');
            }
            else
            {
                sb.Append(method.ReturnType);
            }
            
            sb.Append(' ');
            sb.Append(method.Identifier.ValueText);
            sb.Append('(');

            for (var i = 0; i < method.ParameterList.Parameters.Count; i++)
            {
                if (i != 0) sb.Append(',');
                sb.Append(method.ParameterList.Parameters[i]);
            }

            sb.Append("){throw new Exception();}");
        }

        sb.Append("}}");
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    #endregion
}