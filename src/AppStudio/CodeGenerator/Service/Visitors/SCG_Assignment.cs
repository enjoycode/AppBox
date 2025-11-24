using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitAssignmentExpression(AssignmentExpressionSyntax node)
    {
        //先处理查询类方法内的LambdaExpression，目前主要是UpdateCommand.Update
        if (_queryMethodCtx.HasAny && _queryMethodCtx.Current.InLambdaExpression)
        {
            //cmd.Update(t => t.Value = t.Value + 1) 转换为 cmd.Update(cmd.T["Value"].Assign(cmd.T["Value"] + 1))
            var left = (ExpressionSyntax)node.Left.Accept(this)!;
            var right = (ExpressionSyntax)node.Right.Accept(this)!;

            var methodName = (SimpleNameSyntax)SyntaxFactory.ParseName("Assign");
            var assignMethod =
                SyntaxFactory.MemberAccessExpression(SyntaxKind.SimpleMemberAccessExpression, left, methodName);
            var arg1 = SyntaxFactory.Argument(right);
            var argList = SyntaxFactory.ArgumentList().AddArguments(arg1);
            return SyntaxFactory.InvocationExpression(assignMethod, argList);
        }

        return base.VisitAssignmentExpression(node);
    }
}