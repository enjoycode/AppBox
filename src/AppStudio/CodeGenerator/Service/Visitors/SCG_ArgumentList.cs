using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitArgumentList(ArgumentListSyntax node)
    {
        //因动态查询方法的最后一个参数会被转换为两个参数，所以需要特殊处理
        if (_queryMethodCtx is { HasAny: true, Current: { InLambdaExpression: false, IsDynamicMethod: true } })
        {
            var args = new SeparatedSyntaxList<ArgumentSyntax>();
            for (var i = 0; i < node.Arguments.Count; i++)
            {
                if (i == node.Arguments.Count - 1)
                {
                    //已被VisitQueryMethodLambdaExpression转换为ArgumentListSyntax
                    var lastArgs = (ArgumentListSyntax)node.Arguments[i].Expression.Accept(this)!;
                    args = args.AddRange(lastArgs.Arguments);
                }
                else
                {
                    args = args.Add((ArgumentSyntax)node.Arguments[i].Accept(this)!);
                }
            }

            return SyntaxFactory.ArgumentList(args);
        }

        return base.VisitArgumentList(node);
    }
}