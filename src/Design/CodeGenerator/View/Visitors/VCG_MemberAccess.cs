using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ViewCsGenerator
{
    public override SyntaxNode? VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        var symbol = ModelExtensions.GetSymbolInfo(SemanticModel, node).Symbol;

        //转换RxEmployee.Name 为 RxEmployee.Observe(123/*memberId*/, e => e.Name, (e,v) => e.Name=v)
        if (symbol is IPropertySymbol propertySymbol && propertySymbol.Name != "Target" /*暂简单排除Target属性*/ &&
            IsRxEntity(propertySymbol.ContainingType, out var entityFullName))
        {
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(entityFullName)!;
            var entityModel = (EntityModel)modelNode.Model;
            var memberName = node.Name.Identifier.Text;
            var member = entityModel.GetMember(memberName, true);

            var arg1 = SyntaxFactory.Argument(SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression,
                SyntaxFactory.Literal(member!.MemberId)));
            var arg2 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"e=>e.{member.Name}"));
            var arg3 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"(e,v)=>e.{member.Name}=v"));
            var args = SyntaxFactory.ArgumentList().AddArguments(arg1, arg2, arg3);

            var exp = (ExpressionSyntax)node.Expression.Accept(this)!;
            var methodName = (SimpleNameSyntax)SyntaxFactory.ParseName("Observe");
            exp = SyntaxFactory.MemberAccessExpression(SyntaxKind.SimpleMemberAccessExpression, exp, methodName);
            return SyntaxFactory.InvocationExpression(exp, args);
        }

        return base.VisitMemberAccessExpression(node);
    }
}