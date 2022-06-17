using System.Text;
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
            //先加入IService接口
            var updatedNode = (ClassDeclarationSyntax)base.VisitClassDeclaration(node)!;
            updatedNode = updatedNode.AddBaseListTypes(
                SyntaxFactory.SimpleBaseType(TypeHelper.ServiceInterfaceType));
            //再加入IService接口实现
            var iserivceImplsCode = GenerateIServiceImplementsCode();
            var invokeMethod = SyntaxFactory
                .ParseCompilationUnit(iserivceImplsCode).Members[0];
            return updatedNode.AddMembers(invokeMethod);
        }

        return base.VisitClassDeclaration(node);
    }

    /// <summary>
    /// 生成实现IService的代码
    /// </summary>
    private string GenerateIServiceImplementsCode()
    {
        var sb = new StringBuilder(
            "async System.Threading.Tasks.ValueTask<AppBoxCore.AnyValue> AppBoxCore.IService.InvokeAsync(System.ReadOnlyMemory<char> method, AppBoxCore.InvokeArgs args) { switch(method) { ");
        foreach (var method in _publicMethods)
        {
            sb.AppendFormat("case System.ReadOnlyMemory<char> s when s.Span.SequenceEqual(\"{0}\"):",
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
            var returnTypeSpan = method.ReturnType.ToString().AsSpan();
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
        
            sb.Append(!isReturnVoid ? "));" : "); return AppBoxCore.AnyValue.Empty;");
        }
        
        sb.Append("default: throw new System.Exception(\"Cannot find method: \" + method); }}");
        return sb.ToString();
    }

    /// <summary>
    /// 生成IService调用时根据参数类型生成如args.GetString()
    /// </summary>
    private static string GenArgsGetMethod(string argType)
    {
        switch (argType) //TODO: fix other types
        {
            case "bool": return "args.GetBoolean()";
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