using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        //处理查询类方法的lambda表达式内的实体成员访问,
        //eg: t.Customer.Name 转换为 t["Customer"]["Name"]
        if (queryMethodCtx.HasAny && queryMethodCtx.Current.InLambdaExpression)
        {
            var identifier = FindIndentifierForMemberAccessExpression(node);
            if (identifier != null && queryMethodCtx.Current.IsLambdaParameter(identifier))
            {
                //TODO:考虑进一步判断符号是否相同
                //var symbol = SemanticModel.GetSymbolInfo(identifier).Symbol;

                var sb = StringBuilderCache.Acquire();
                BuildQueryMethodMemberAccess(node, identifier, sb);
                //TODO:判断是否由上级处理换行
                //return SyntaxFactory.ParseExpression(sb.ToString()).WithTrailingTrivia(GetEndOfLineTrivia(node, false));
                return SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb))
                    .WithTriviaFrom(node);
            }
        }

        return base.VisitMemberAccessExpression(node);
    }

    private static IdentifierNameSyntax? FindIndentifierForMemberAccessExpression(
        MemberAccessExpressionSyntax node)
    {
        while (true)
        {
            if (node.Expression is IdentifierNameSyntax identifierNameSyntax)
                return identifierNameSyntax;

            if (node.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                node = memberAccess;
                continue;
            }

            return null;
        }
    }

    private void BuildQueryMethodMemberAccess(MemberAccessExpressionSyntax node,
        IdentifierNameSyntax targetIdentifier, StringBuilder sb)
    {
        //根据是否在Sql查询内使用不同的处理方式
        if (queryMethodCtx.Current.IsSystemQuery)
        {
            throw new NotImplementedException();
            // if (node.Expression is IdentifierNameSyntax)
            // {
            //     var expSymbol = SemanticModel.GetSymbolInfo(node).Symbol;
            //     var memberId = GetEntityMemberId(expSymbol);
            //     var valueType = ((IPropertySymbol)expSymbol).Type;
            //     var valueTypeName = TypeHelper.GetEntityMemberTypeString(valueType, out _);
            //
            //     sb.Insert(0,
            //         $"{targetIdentifier.Identifier.ValueText}.Get{valueTypeName}({memberId})");
            // }
            // else if (node.Expression is MemberAccessExpressionSyntax)
            // {
            //     BuildQueryMethodMemberAccess((MemberAccessExpressionSyntax)node.Expression,
            //         targetIdentifier, sb);
            //     sb.AppendFormat(".{0}", node.Name.Identifier.ValueText);
            // }
        }
        else
        {
            if (node.Expression is IdentifierNameSyntax)
            {
                sb.Insert(0,
                    $"{targetIdentifier.Identifier.ValueText}[\"{node.Name.Identifier.ValueText}\"]");
            }
            else if (node.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                BuildQueryMethodMemberAccess(memberAccess, targetIdentifier, sb);

                //判断是否实体成员
                var symbol = SemanticModel.GetSymbolInfo(node).Symbol!;
                var modelNode =
                    DesignHub.DesignTree.FindModelNodeByFullName(symbol.ContainingType.ToString())!;
                var model = (EntityModel)modelNode.Model;
                var isEntityMember = model.GetMember(symbol.Name, false) != null;

                sb.AppendFormat(isEntityMember ? "[\"{0}\"]" : ".{0}",
                    node.Name.Identifier.ValueText);
            }
        }
    }
}