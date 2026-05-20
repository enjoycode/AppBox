using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

partial class ExpressionParser
{
    public override Expression? VisitAwaitExpression(AwaitExpressionSyntax node)
    {
        var expression = Visit(node.Expression)!;
        return new AwaitExpression(expression);
    }
}