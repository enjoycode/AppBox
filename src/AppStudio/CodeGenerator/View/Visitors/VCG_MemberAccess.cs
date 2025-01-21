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

        var res = TryInterceptRxEntity(symbol, node);
        if (res != null)
            return res;
        res = TryInterceptPermission(symbol, node);
        if (res != null)
            return res;

        return base.VisitMemberAccessExpression(node);
    }

    //转换RxEmployee.Name 为 RxEmployee.Observe(123/*memberId*/, e => e.Name, (e,v) => e.Name=v)
    private SyntaxNode? TryInterceptRxEntity(ISymbol? symbol, MemberAccessExpressionSyntax node)
    {
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

        return null;
    }

    private SyntaxNode? TryInterceptPermission(ISymbol? symbol, MemberAccessExpressionSyntax node)
    {
        if (symbol is IPropertySymbol propertySymbol && propertySymbol.ContainingType.IsStatic &&
            propertySymbol.ContainingType.ContainingNamespace.Name == "Permissions" &&
            IsPermissionClass(propertySymbol.ContainingType))
        {
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(propertySymbol.ContainingType.ToString()!)!;
            var modelId = modelNode.Model.Id.Value;
            var memberName = node.Name.Identifier.Text;

            var arg = SyntaxFactory.Argument(SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression,
                SyntaxFactory.Literal(modelId)));
            var args = SyntaxFactory.ArgumentList().AddArguments(arg);
            var exp = SyntaxFactory.ParseExpression($"AppBoxClient.PermissionManager.GetPermission{memberName}");
            return SyntaxFactory.InvocationExpression(exp, args);
        }

        return null;
    }

    private static bool IsPermissionClass(INamedTypeSymbol type)
    {
        return type.GetAttributes()
            .Any(a => a.AttributeClass != null &&
                      a.AttributeClass.ToString() == TypeHelper.PermissionAttribte);
    }
}