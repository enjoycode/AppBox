using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

/// <summary>
/// 转换调用服务的代码，eg:
/// var res = await sys.Services.HelloService.SayHello("aa", 123)
/// var res = await RuntimeContext.Invoke~string~("sys.HelloService.SayHello", AnyValue.From("aa"), AnyValue.From(123))
/// </summary>
internal sealed class CallServiceInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "CallService";
    internal static readonly CallServiceInterceptor Default = new();

    private CallServiceInterceptor() { }

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        var generator = (ICodeGeneratorWithUsages)visitor;
        return VisitInvokeAppBoxService(generator, node, symbol);
    }

    /// <summary>
    /// 转换视图模型调用服务或服务模型调用其他服务
    /// </summary>
    private static InvocationExpressionSyntax VisitInvokeAppBoxService(ICodeGeneratorWithUsages generator,
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
            methodName = "RuntimeContext.Invoke";
        }

        if (isReturnGenericTask)
        {
            var returnType = ((INamedTypeSymbol)symbol.ReturnType).TypeArguments[0];
            methodName += $"<{returnType}>";
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
                    var anyValueFrom = CodeGeneratorUtil.MakeAnyValueFrom(argument.Expression);
                    args = args.AddArguments(SyntaxFactory.Argument(anyValueFrom));
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