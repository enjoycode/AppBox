using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitClassDeclaration(ClassDeclarationSyntax node)
    {
        if (TypeHelper.IsServiceClass(node, AppName, ServiceModel.Name))
        {
            //IService接口
            var updatedNode = (ClassDeclarationSyntax)base.VisitClassDeclaration(node)!;
            updatedNode = updatedNode.AddBaseListTypes(
                SyntaxFactory.SimpleBaseType(TypeHelper.ServiceInterfaceType));
            
            //实体工厂
            var entityFactoriesCode = GenerateEntityFactoriesCode();
            var entityFactories =
                SyntaxFactory.ParseCompilationUnit(entityFactoriesCode).Members[0];
            updatedNode = updatedNode.AddMembers(entityFactories);
            
            //IService接口实现
            var iserivceImplsCode = GenerateIServiceImplementsCode();
            var invokeMethod = SyntaxFactory
                .ParseCompilationUnit(iserivceImplsCode).Members[0];
            return updatedNode.AddMembers(invokeMethod);
        }

        return base.VisitClassDeclaration(node);
    }

    /// <summary>
    /// 生成反序列化时的实体工厂(只需要直接引用的实体)
    /// </summary>
    /// <returns></returns>
    private string GenerateEntityFactoriesCode()
    {
        var sb = StringBuilderCache.Acquire();

        sb.Append("private static readonly AppBoxCore.EntityFactory[] _entityFactories=");
        if (_usedEntities.Count == 0)
            sb.Append("Array.Empty<EntityFactory>();");
        else
        {
            sb.Append('{');
            var sep = false;
            foreach (var usedEntity in _usedEntities)
            {
                if (sep == false) sep = true;
                else sb.Append(',');

                var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(usedEntity)!;
                sb.Append("new (");
                sb.Append(modelNode.Model.Id.Value.ToString());
                sb.Append(", ()=>new ");
                sb.Append(usedEntity);
                sb.Append("())");
            }
        }

        sb.Append("};\n");
        
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    /// <summary>
    /// 生成实现IService的代码
    /// </summary>
    private string GenerateIServiceImplementsCode()
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append(
            "async ValueTask<AppBoxCore.AnyValue> AppBoxCore.IService.InvokeAsync(ReadOnlyMemory<char> method, AppBoxCore.InvokeArgs args) {\n");
        sb.Append("args.SetEntityFactories(_entityFactories);\n");
        sb.Append("switch(method) {\n");
        
        foreach (var method in _publicMethods)
        {
            sb.AppendFormat("case ReadOnlyMemory<char> s when s.Span.SequenceEqual(\"{0}\"):",
                method.Identifier.ValueText);
            //TODO: 插入验证权限代码
            // if (publicMethodsInvokePermissions.TryGetValue(method.Identifier.ValueText,
            //         out string invokePermissionCode))
            // {
            //     sb.AppendFormat("{1}if (!({0})) throw new System.Exception(\"无调用服务方法的权限\");{1}",
            //         invokePermissionCode, Environment.NewLine);
            // }
        
            //插入调用代码
            //TODO:暂简单判断有无返回值，应直接判断是否Awaitable，另处理同步方法调用
            var isReturnVoid = method.IsReturnVoid();
            var isReturnTask = !isReturnVoid && method.IsReturnTask();
            if (!isReturnVoid)
                sb.Append("return AppBoxCore.AnyValue.From(");
            if (isReturnTask)
                sb.Append("await ");
            sb.AppendFormat("{0}(", method.Identifier.ValueText);
            for (var i = 0; i < method.ParameterList.Parameters.Count; i++)
            {
                //var typeSymbol = SemanticModel.GetSymbolInfo(method.ParameterList.Parameters[i].Type).Symbol;
                var paraType = method.ParameterList.Parameters[i].Type!.ToString();
                sb.Append(GenArgsGetMethod(paraType));
        
                if (i != method.ParameterList.Parameters.Count - 1)
                    sb.Append(",");
            }
        
            sb.Append(!isReturnVoid ? "));\n" : "); return AppBoxCore.AnyValue.Empty;\n");
        }
        
        sb.Append("default: throw new Exception(\"Cannot find method: \" + method);\n}\n}");
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    /// <summary>
    /// 生成IService调用时根据参数类型生成如args.GetString()
    /// </summary>
    private static string GenArgsGetMethod(string argType)
    {
        switch (argType) //TODO: fix other types
        {
            case "bool": return "args.GetBool()";
            case "int": return "args.GetInt()";
            case "float": return "args.GetFloat()";
            case "double": return "args.GetDouble()";
            case "char": return "args.GetChar()";
            case "sbyte": return "args.GetSByte()";
            case "byte": return "args.GetByte()";
            case "string": return "args.GetString()";
            case "DateTime":
            case "System.DateTime": return "args.GetDateTime()";
            case "Guid":
            case "System.Guid": return "args.GetGuid()";
            default:
                return $"({argType})args.GetObject()";
        }
    }
}