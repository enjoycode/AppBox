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
            var entityFactoriesCode =
                CodeGeneratorUtil.GenerateEntityFactoriesCode(DesignHub, _usedEntities);
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
                sb.Append(GenArgsGetMethod(method.ParameterList.Parameters[i].Type!));

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
    private string GenArgsGetMethod(TypeSyntax argType)
    {
        var typeSymbol = (ITypeSymbol)SemanticModel.GetSymbolInfo(argType).Symbol!;
        var specType = typeSymbol.SpecialType;
        switch (specType)
        {
            case SpecialType.System_Boolean: return "args.GetBool()";
            case SpecialType.System_Byte: return "args.GetByte()";
            case SpecialType.System_Int16: return "args.GetShort()";
            case SpecialType.System_Int32: return "args.GetInt()";
            case SpecialType.System_Int64: return "args.GetLong()";
            case SpecialType.System_DateTime: return "args.GetDateTime()";
            case SpecialType.System_Single: return "args.GetFloat()";
            case SpecialType.System_Double: return "args.GetDouble()";
            case SpecialType.System_String: return "args.GetString()";
        }

        //特殊处理范型集合
        if (typeSymbol is IArrayTypeSymbol arrayTypeSymbol)
        {
            var elementType = arrayTypeSymbol.ElementType;
            return $"args.GetArray<{elementType}>()";
        }

        if (TypeHelper.IsListGeneric(typeSymbol, TypeSymbolCache))
        {
            var elementType = ((INamedTypeSymbol)typeSymbol).TypeArguments[0];
            return $"({argType})args.GetList<{elementType}>()";
        }

        return $"({argType})args.GetObject()";
    }
}