using AppBoxCore;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign.CodeGenerator;

internal partial class ExpressionParser
{
    public override Expression? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        if (node.Expression is MemberAccessExpressionSyntax memberAccess)
        {
            var exp = memberAccess.Expression.Accept(this);
            var methodName = memberAccess.Name.Identifier.Text;
            Expression[]? args = null;
            if (node.ArgumentList.Arguments.Count > 0)
            {
                args = new Expression[node.ArgumentList.Arguments.Count];
                for (var i = 0; i < args.Length; i++)
                {
                    //TODO: check not supported ref and out
                    args[i] = node.ArgumentList.Arguments[i].Expression.Accept(this)!;
                }
            }

            return new MethodCallExpression(exp!, methodName, args);
        }
        else
        {
            throw new NotImplementedException();
        }
    }
}