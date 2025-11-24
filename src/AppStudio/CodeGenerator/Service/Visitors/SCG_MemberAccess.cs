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
        if (_queryMethodCtx.HasAny && _queryMethodCtx.Current.InLambdaExpression)
        {
            var identifier = FindIdentifierForMemberAccessExpression(node);
            if (identifier != null && _queryMethodCtx.Current.IsLambdaParameter(identifier))
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

        //拦截器处理
        var expSymbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (expSymbol != null)
        {
            var interceptor = GetMemberAccessInterceptor(expSymbol);
            if (interceptor != null)
                return interceptor.VisitMemberAccess(node, expSymbol, this);
        }

        return base.VisitMemberAccessExpression(node);
    }

    private static IdentifierNameSyntax? FindIdentifierForMemberAccessExpression(MemberAccessExpressionSyntax node)
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

            //特殊处理 eg: t.Goods!.Name
            if (node.Expression is PostfixUnaryExpressionSyntax postfixUnary)
            {
                if (postfixUnary.IsKind(SyntaxKind.SuppressNullableWarningExpression))
                {
                    if (postfixUnary.Operand is IdentifierNameSyntax identifierNameSyntax2)
                        return identifierNameSyntax2;
                    if (postfixUnary.Operand is MemberAccessExpressionSyntax memberAccess2)
                    {
                        node = memberAccess2;
                        continue;
                    }
                }
            }

            return null;
        }
    }

    private void BuildQueryMethodMemberAccess(MemberAccessExpressionSyntax node,
        IdentifierNameSyntax targetIdentifier, StringBuilder sb)
    {
        //根据是否在Sql查询内使用不同的处理方式
        if (_queryMethodCtx.Current.IsSystemQuery)
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
                sb.Insert(0, $"{targetIdentifier.Identifier.ValueText}[\"{node.Name.Identifier.ValueText}\"]");
            }
            else if (node.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                BuildQueryMethodMemberAccess(memberAccess, targetIdentifier, sb);
                BuildQueryMethodMemberPath(node, sb);
            }
            else if (node.Expression is PostfixUnaryExpressionSyntax postfixUnary)
            {
                if (postfixUnary.Operand is MemberAccessExpressionSyntax memberAccess2)
                {
                    BuildQueryMethodMemberAccess(memberAccess2, targetIdentifier, sb);
                    BuildQueryMethodMemberPath(node, sb);
                }
            }
        }
    }

    private void BuildQueryMethodMemberPath(MemberAccessExpressionSyntax node, StringBuilder sb)
    {
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol!;
        //判断是否方法调用 eg: t.Name.Contains
        //TODO:暂简单处理，应转换或排除不支持的方法
        if (symbol is IMethodSymbol methodSymbol)
        {
            sb.Append($".{methodSymbol.Name}");
        }
        else
        {
            //判断是否实体成员
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(symbol.ContainingType.ToString()!)!;
            var model = (EntityModel)modelNode.Model;
            var isEntityMember = model.GetMember(symbol.Name, false) != null;

            sb.AppendFormat(isEntityMember ? "[\"{0}\"]" : ".{0}", node.Name.Identifier.ValueText);
        }
    }
}