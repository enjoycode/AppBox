using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitMemberAccessExpression(MemberAccessExpressionSyntax node)
    {
        //处理查询类方法的lambda表达式内的实体成员访问,
        //eg: t.Customer.Name 转换为 t.R("Customer", 12345).F("Name")
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
                return interceptor.VisitMemberAccess(node, expSymbol, this!);
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
            var symbol = SemanticModel.GetSymbolInfo(node).Symbol!;
            if (node.Expression is IdentifierNameSyntax)
            {
                var pathMethodName = GetMemberPathMethod(symbol, out long modelId);
                var identifierName = targetIdentifier.Identifier.ValueText;
                var memberName = node.Name.Identifier.ValueText;
                if (pathMethodName is nameof(IMemberPathBuilder.R) or nameof(IMemberPathBuilder.S))
                    sb.Insert(0, $"{identifierName}.{pathMethodName}(\"{memberName}\", {modelId}L)");
                else
                    sb.Insert(0, $"{identifierName}.{pathMethodName}(\"{memberName}\")");
            }
            else if (node.Expression is MemberAccessExpressionSyntax memberAccess)
            {
                BuildQueryMethodMemberAccess(memberAccess, targetIdentifier, sb);
                BuildQueryMethodMemberPath(node, symbol, sb);
            }
            else if (node.Expression is PostfixUnaryExpressionSyntax postfixUnary)
            {
                if (postfixUnary.Operand is MemberAccessExpressionSyntax memberAccess2)
                {
                    BuildQueryMethodMemberAccess(memberAccess2, targetIdentifier, sb);
                    BuildQueryMethodMemberPath(node, symbol, sb);
                }
            }
        }
    }

    private void BuildQueryMethodMemberPath(MemberAccessExpressionSyntax node, ISymbol nodeSymbol, StringBuilder sb)
    {
        //判断是否方法调用 eg: t.Name.Contains
        if (nodeSymbol is IMethodSymbol methodSymbol)
        {
            //TODO:暂简单处理，应转换或排除不支持的方法
            sb.Append($".{methodSymbol.Name}");
        }
        else
        {
            var pathMethodName = GetMemberPathMethod(nodeSymbol, out long modelId);
            var memberName = node.Name.Identifier.ValueText;
            if (pathMethodName is nameof(IMemberPathBuilder.R) or nameof(IMemberPathBuilder.S))
                sb.Append($".{pathMethodName}(\"{memberName}\", {modelId}L)");
            else
                sb.Append($".{pathMethodName}(\"{memberName}\")");
        }
    }

    private string GetMemberPathMethod(ISymbol symbol, out long modelId)
    {
        // is Entity
        if (symbol.ContainingType.IsInherits(TypeSymbolCache.TypeOfEntity))
        {
            var entityType = symbol.ContainingType;
            var memberName = symbol.Name;

            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(entityType.ToString()!)!;
            var entityModel = (EntityModel)modelNode.Model;
            var entityMember = entityModel.GetMember(memberName, false);
            if (entityMember == null)
                throw new NotSupportedException("Only support EntityMember");

            if (entityMember is EntitySetMember entitySetMember)
            {
                modelId = entitySetMember.RefModelId;
                return nameof(IMemberPathBuilder.S);
            }

            if (entityMember is EntityRefMember entityRefMember)
            {
                if (entityRefMember.IsAggregationRef)
                    throw new NotSupportedException("AggregationRef is not supported");
                modelId = entityRefMember.RefModelIds[0];
                return nameof(IMemberPathBuilder.R);
            }

            if (entityMember is EntityFieldMember)
            {
                modelId = 0;
                return nameof(IMemberPathBuilder.F);
            }

            throw new NotSupportedException("Only EntitySet/EntityRef/EntityField supported");
        }

        // none Entity, eg: SubQuery's select item
        modelId = 0;
        return nameof(IMemberPathBuilder.U);
    }
}