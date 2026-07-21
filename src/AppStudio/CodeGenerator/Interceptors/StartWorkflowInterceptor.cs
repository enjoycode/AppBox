using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 启动工作流实例的方法拦截器
/// </summary>
/// <remarks>
/// sys.Workflows.LeaveFlow.StartAsync(3);
/// 转换为
/// RuntimeContext.Invoke("sys.WorkflowService.Start", new WorkflowParameters(["Days"], [AnyValue.From(3)]))
/// </remarks>
internal sealed class StartWorkflowInterceptor : IInvocationInterceptor<SyntaxNode>
{
    internal const string Name = "StartWorkflow";
    internal static readonly StartWorkflowInterceptor Default = new();

    private StartWorkflowInterceptor() { }

    public SyntaxNode VisitInvocation(InvocationExpressionSyntax node, IMethodSymbol symbol,
        CSharpSyntaxVisitor<SyntaxNode> visitor)
    {
        var invokeMethodName = visitor switch
        {
            ServiceCodeGenerator => "RuntimeContext.Invoke",
            ViewCsGenerator => "AppBoxClient.Channel.Invoke",
            _ => throw new NotImplementedException($"{visitor.GetType().Name} not implemented")
        };

        var parameterCount = symbol.Parameters.Length;
        var keys = new ExpressionSyntax[parameterCount];
        var values = new ExpressionSyntax[parameterCount];
        for (var i = 0; i < parameterCount; i++)
        {
            keys[i] = SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
                SyntaxFactory.Literal(symbol.Parameters[i].Name));
            var argument = node.ArgumentList.Arguments[i];
            values[i] = CodeGeneratorUtil.MakeAnyValueFrom(argument.Expression).WithTriviaFrom(argument);
        }

        var keysList = SyntaxFactory.SeparatedList<CollectionElementSyntax>(
            (keys.Select(SyntaxFactory.ExpressionElement).ToArray()));
        var valuesList = SyntaxFactory.SeparatedList<CollectionElementSyntax>(
            (values.Select(SyntaxFactory.ExpressionElement).ToArray()));

        var keysArg = SyntaxFactory.Argument(SyntaxFactory.CollectionExpression(keysList));
        var valuesArg = SyntaxFactory.Argument(SyntaxFactory.CollectionExpression(valuesList));

        var newArgs = SyntaxFactory.ArgumentList().AddArguments(keysArg, valuesArg);
        var newParas = SyntaxFactory.ObjectCreationExpression(
            SyntaxFactory.ParseTypeName("AppBoxCore.WorkflowParameters"),
            newArgs, null
        );

        var method = SyntaxFactory.ParseExpression(invokeMethodName);
        var arg1 = SyntaxFactory.Argument(SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
            SyntaxFactory.Literal("sys.WorkflowService.Start")));
        var arg2 = SyntaxFactory.Argument(CodeGeneratorUtil.MakeAnyValueFrom(newParas));
        var args = SyntaxFactory.ArgumentList().AddArguments(arg1, arg2);
        var res = SyntaxFactory.InvocationExpression(method, args).WithTriviaFrom(node);
        return res;
    }
}