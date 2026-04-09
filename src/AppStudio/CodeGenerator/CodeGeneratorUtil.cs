using System.Text;
using AppBoxCore;
using RoslynUtils;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Emit;

namespace AppBoxDesign;

internal static class CodeGeneratorUtil
{
    /// <summary>
    /// 检查语义错误，不成功抛出异常
    /// </summary>
    internal static void CheckSemantic(SemanticModel semanticModel, ModelNode modelNode)
    {
        var diagnostics = semanticModel.GetDiagnostics();
        if (diagnostics.Length <= 0) return;

        var errors = diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error).ToArray();
        if (errors.Length <= 0) return;

        var sb = new StringBuilder("语义错误:");
        sb.AppendLine();
        for (var i = 0; i < errors.Length; i++)
        {
            var error = errors[i];
            var lineSpan = error.Location.GetLineSpan();

            sb.Append(i + 1);
            sb.Append(". ");
            sb.Append(modelNode.AppNode.Model.Name);
            sb.Append('.');
            sb.Append(modelNode.Model.Name);
            sb.Append('[');
            sb.Append(lineSpan.StartLinePosition.Line + 1);
            sb.Append(',');
            sb.Append(lineSpan.StartLinePosition.Character);
            sb.Append("]-[");
            sb.Append(lineSpan.EndLinePosition.Line + 1);
            sb.Append(',');
            sb.Append(lineSpan.EndLinePosition.Character);
            sb.Append("]: ");
            sb.AppendLine(error.GetMessage());
        }

        throw new Exception(sb.ToString());
    }

    /// <summary>
    /// 检查编译是否成功，不成功则抛出异常
    /// </summary>
    internal static void CheckEmitResult(EmitResult emitResult)
    {
        if (emitResult.Success) return;

        var sb = new StringBuilder("编译错误:\n");
        for (var i = 0; i < emitResult.Diagnostics.Length; i++)
        {
            var error = emitResult.Diagnostics[i];
            sb.AppendFormat("{0}. {1}", i + 1, error);
            sb.AppendLine();
        }

        throw new Exception(sb.ToString());
    }

    /// <summary>
    /// 转换视图或服务模型时生成使用到的实体模型的运行时代码，包括EntityRef及EntitySet的引用
    /// </summary>
    internal static void BuildUsedEntity(DesignHub hub, ModelNode modelNode,
        IDictionary<string, SyntaxTree> ctx, CSharpParseOptions parseOptions)
    {
        var fullName = $"{modelNode.AppName}.Entities.{modelNode.Model.Name}";
        if (ctx.ContainsKey(fullName)) return;

        //处理自身
        var code = EntityCsGenerator.GenRuntimeCode(modelNode);
        var syntaxTree = SyntaxFactory.ParseSyntaxTree(code, parseOptions);
        ctx.Add(fullName, syntaxTree);

        //处理引用
        var model = (EntityModel)modelNode.Model;
        var refs = model.Members
            .Where(t => t.Type == EntityMemberType.EntityRef)
            .Cast<EntityRefMember>();
        foreach (var refModel in refs)
        {
            foreach (var refModelId in refModel.RefModelIds)
            {
                var refModelNode = hub.DesignTree.FindModelNode(refModelId)!;
                BuildUsedEntity(hub, refModelNode, ctx, parseOptions);
            }
        }

        var sets = model.Members
            .Where(t => t.Type == EntityMemberType.EntitySet)
            .Cast<EntitySetMember>();
        foreach (var setModel in sets)
        {
            var setModelNode = hub.DesignTree.FindModelNode(setModel.RefModelId)!;
            BuildUsedEntity(hub, setModelNode, ctx, parseOptions);
        }

        //实体枚举成员的处理
        var enumMembers = model.Members
            .Where(m => m is EntityFieldMember { FieldType: EntityFieldType.Enum })
            .Cast<EntityFieldMember>();
        foreach (var m in enumMembers)
        {
            var enumModelNode = hub.DesignTree.FindModelNode(m.EnumModelId!.Value)!;
            BuildUsedEnum(hub, enumModelNode, ctx, parseOptions);
        }
    }

    internal static void BuildUsedEnum(DesignHub hub, ModelNode modelNode,
        IDictionary<string, SyntaxTree> ctx, CSharpParseOptions parseOptions)
    {
        var fullName = $"{modelNode.AppName}.Enums.{modelNode.Model.Name}";
        if (ctx.ContainsKey(fullName)) return;

        var code = EnumCodeGenerator.GenEnumCode((EnumModel)modelNode.Model, modelNode.AppName);
        var syntaxTree = SyntaxFactory.ParseSyntaxTree(code, parseOptions);
        ctx.Add(fullName, syntaxTree);
    }

    private const string EmptyEntityFactories =
        "private static readonly EntityFactory[] _entityFactories=Array.Empty<EntityFactory>();\n";

    /// <summary>
    /// 生成反序列化时的实体工厂
    /// </summary>
    /// <returns></returns>
    internal static string GenerateEntityFactoriesCode(DesignHub hub, HashSet<string> usedModels)
    {
        if (usedModels.Count == 0)
            return EmptyEntityFactories;

        var entities = usedModels.Select(name => hub.DesignTree.FindModelNodeByFullName(name))
            .Where(node => node != null && node.Model.ModelType == ModelType.Entity)
            .ToArray();
        if (entities.Length == 0)
            return EmptyEntityFactories;

        var sb = StringBuilderCache.Acquire();
        sb.Append("private static readonly AppBoxCore.EntityFactory[] _entityFactories={");
        var sep = false;
        foreach (var usedEntity in entities)
        {
            if (sep == false) sep = true;
            else sb.Append(',');

            sb.Append("new (");
            sb.Append(usedEntity!.Model.Id.Value.ToString());
            sb.Append("L, typeof(");
            sb.Append(usedEntity.AppNode.Model.Name);
            sb.Append(".Entities.");
            sb.Append(usedEntity.Model.Name);
            sb.Append("))");
        }

        sb.Append("};\n");
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    /// <summary>
    /// 转换视图模型调用服务或服务模型调用其他服务
    /// </summary>
    internal static InvocationExpressionSyntax VisitInvokeAppBoxService(ICodeGeneratorWithUsages generator,
        InvocationExpressionSyntax node, IMethodSymbol symbol)
    {
        // //考虑判断参数数量是否超出
        // if (node.ArgumentList.Arguments.Count > AnyArgs.MAX_COUNT)
        //     throw new ArgumentException();

        //返回类型是Task<T>或Task
        var isReturnGenericTask = ((INamedTypeSymbol)symbol.ReturnType).IsGenericType;
        //需要检查返回类型内是否包含实体，是则加入引用模型列表内
        if (isReturnGenericTask)
            symbol.ReturnType.CheckTypeHasAppBoxModel(generator.FindModel, generator.AddUsedModel);

        //转换服务方法调用为 AppBoxClient.Channel.Invoke()
        var appName = symbol.ContainingNamespace.ContainingNamespace.Name;
        var servicePath = $"{appName}.{symbol.ContainingType.Name}.{symbol.Name}";

        string methodName;
        var isUploadMethod = false;
        var isDownloadMethod = false;
        if (generator.TargetModelType == ModelType.View)
        {
            isUploadMethod = symbol.IsServiceUploadMethod();
            isDownloadMethod = symbol.IsServiceDownloadMethod();
            if (isUploadMethod)
                methodName = "AppBoxClient.Channel.Upload";
            else if (isDownloadMethod)
                methodName = "AppBoxClient.Channel.Download";
            else
                methodName = "AppBoxClient.Channel.Invoke";
        }
        else
        {
            methodName = "AppBoxServer.HostRuntimeContext.Invoke";
        }

        if (isReturnGenericTask)
        {
            var rt = ((INamedTypeSymbol)symbol.ReturnType).TypeArguments[0];
            methodName += $"<{rt}>";
        }

        var method = SyntaxFactory.ParseExpression(methodName);
        //服务名称参数 eg: "sys.OrderService.GetOrder
        var serviceArg = SyntaxFactory.Argument(
            SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
                SyntaxFactory.Literal(servicePath))
        );
        var args = SyntaxFactory.ArgumentList().AddArguments(serviceArg);
        //转换原来的参数, eg: 1, "aa" => AnyValue.From(1), AnyValue.From("aa")
        if (node.ArgumentList.Arguments.Count > 0)
        {
            for (var i = 0; i < node.ArgumentList.Arguments.Count; i++)
            {
                var argument = node.ArgumentList.Arguments[i];
                if (i == 0 && (isUploadMethod || isDownloadMethod))
                {
                    args = args.AddArguments(SyntaxFactory.Argument(argument.Expression));
                }
                else
                {
                    var anyValueFromMethod = SyntaxFactory.ParseExpression("AnyValue.From");
                    var anyValueFromValue = SyntaxFactory.Argument(argument.Expression);
                    var anyValueFromArgs = SyntaxFactory.ArgumentList().AddArguments(anyValueFromValue);
                    var anyValueFromInvoke = SyntaxFactory.InvocationExpression(anyValueFromMethod, anyValueFromArgs);

                    args = args.AddArguments(SyntaxFactory.Argument(anyValueFromInvoke));
                }
            }
        }

        //附加反序列化需要的entity factory arg
        if (isReturnGenericTask)
        {
            var entityFactories = SyntaxFactory.IdentifierName("_entityFactories");
            args = args.AddArguments(SyntaxFactory.Argument(entityFactories));
        }

        var res = SyntaxFactory.InvocationExpression(method, args).WithTriviaFrom(node);
        return res;
    }
}