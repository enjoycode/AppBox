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
            updatedNode = updatedNode.AddBaseListTypes(SyntaxFactory.SimpleBaseType(TypeHelper.ServiceInterfaceType));

            //实体工厂
            var entityFactoriesCode = CodeGeneratorUtil.GenerateEntityFactoriesCode(DesignHub, _usedEntities);
            var entityFactories = SyntaxFactory.ParseMemberDeclaration(entityFactoriesCode)!;

            //IService接口实现
            var serviceImplsCode = GenerateIServiceImplementsCode();
            var invokeMethod = SyntaxFactory.ParseMemberDeclaration(serviceImplsCode)!;

            return updatedNode.AddMembers(entityFactories, invokeMethod);
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
            "public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IAnyArgs{\n");
        sb.Append("args.SetEntityFactories(_entityFactories);\n");
        sb.Append("switch(method.Span) {\n");

        foreach (var method in _publicMethods)
        {
            var methodName = method.Identifier.ValueText;
            sb.Append("case ");
            sb.Append('"');
            sb.Append(methodName);
            sb.Append('"');
            sb.Append(':');
            //插入验证权限代码
            if (_publicMethodsInvokePermissions.TryGetValue(methodName, out var invokePermissionCode))
                sb.AppendFormat("\nif (!({0})) throw new System.Exception(\"无调用服务方法的权限\");\n", invokePermissionCode);

            //插入调用代码
            //TODO:暂简单判断有无返回值，应直接判断是否Awaitable，另处理同步方法调用
            var isReturnTask = method.IsReturnTask();
            var isReturnVoidTask = isReturnTask &&
                                   !((INamedTypeSymbol)SemanticModel.GetSymbolInfo(method.ReturnType).Symbol!)
                                       .IsGenericType;
            var isReturnVoid = method.IsReturnVoid() || isReturnVoidTask;
            if (!isReturnVoid) sb.Append("return AnyValue.From(");
            if (isReturnTask) sb.Append("await ");
            sb.Append(methodName);
            sb.Append('(');
            for (var i = 0; i < method.ParameterList.Parameters.Count; i++)
            {
                sb.Append(GenArgsGetMethod(method.ParameterList.Parameters[i].Type!));

                if (i != method.ParameterList.Parameters.Count - 1)
                    sb.Append(',');
            }

            sb.Append(!isReturnVoid ? "));\n" : "); return AnyValue.Empty;\n");
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
        //先判断是否Nullable<T>
        var isNullable = false;
        var specType = typeSymbol.SpecialType;
        if (typeSymbol.IsValueType &&
            typeSymbol is INamedTypeSymbol
            {
                IsGenericType: true, OriginalDefinition.SpecialType: SpecialType.System_Nullable_T
            } namedType)
        {
            isNullable = true;
            specType = namedType.TypeArguments[0].SpecialType;
        }

        switch (specType)
        {
            case SpecialType.System_Boolean: return isNullable ? "args.GetBool()" : "args.GetBool()!.Value";
            case SpecialType.System_Byte: return isNullable ? "args.GetByte()" : "args.GetByte()!.Value";
            case SpecialType.System_Int16: return isNullable ? "args.GetShort()" : "args.GetShort()!.Value";
            case SpecialType.System_Int32: return isNullable ? "args.GetInt()" : "args.GetInt()!.Value";
            case SpecialType.System_Int64: return isNullable ? "args.GetLong()" : "args.GetLong()!.Value";
            case SpecialType.System_DateTime: return isNullable ? "args.GetDateTime()" : "args.GetDateTime()!.Value";
            case SpecialType.System_Single: return isNullable ? "args.GetFloat()" : "args.GetFloat()!.Value";
            case SpecialType.System_Double: return isNullable ? "args.GetDouble()" : "args.GetDouble()!.Value";
            case SpecialType.System_Decimal: return isNullable ? "args.GetDecimal()" : "args.GetDecimal()!.Value";
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