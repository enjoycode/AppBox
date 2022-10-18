using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    
    //TODO: remove this
    
    public override SyntaxNode? VisitArgumentList(ArgumentListSyntax node)
    {
        // //注意：相关Query.XXXJoin(join, (u, j1) => u.ID == j1.OtherID)不处理，因本身需要之前的参数
        // if (queryMethodCtx.HasAny && !queryMethodCtx.Current.HoldLambdaArgs &&
        //     !queryMethodCtx.Current.InLambdaExpression)
        // {
        //     var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //     //eg: q.Where(join1, (u, j1) => u.ID == j1.OtherID)
        //     //注意：只处理最后一个参数，即移除之前的参数，如上示例中的join1参数，最后的Lambda由VisitQueryMethodLambdaExpression处理
        //     var newArgNode = node.Arguments[node.Arguments.Count - 1].Expression.Accept(this)!;
        //
        //     //eg: q.ToList(join1, (t, j1) => new {t.ID, t.Name, j1.Address})
        //     //需要处理 new {XX,XX,XX}为参数列表
        //     if ((queryMethodCtx.Current.MethodName == "ToScalarAsync"
        //          || queryMethodCtx.Current.MethodName == "ToListAsync"
        //          || queryMethodCtx.Current.MethodName == "Output")
        //         && newArgNode is ArgumentListSyntax argList)
        //     {
        //         //已被VisitQueryMethodLambdaExpression转换为ArgumentListSyntax
        //         args = args.AddRange(argList.Arguments);
        //     }
        //     else
        //     {
        //         args = args.Add(SyntaxFactory.Argument((ExpressionSyntax)newArgNode));
        //     }
        //
        //     return SyntaxFactory.ArgumentList(args);
        // }

        return base.VisitArgumentList(node);
    }
}