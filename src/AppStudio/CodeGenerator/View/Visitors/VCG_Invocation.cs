using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ViewCsGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol as IMethodSymbol;
        //转换处理调用服务方法
        if (methodSymbol != null && methodSymbol.IsAppBoxServiceMethod())
            return CodeGeneratorUtil.VisitInvokeAppBoxService(this, node, methodSymbol);
        //转换处理Entity.Observe() or RxEntity.Observe()
        if (methodSymbol is { Name: "Observe" })
        {
            var typeFullName = methodSymbol.ContainingType.ToString() ?? string.Empty;
            if (typeFullName == "AppBoxClient.EntityExtensions" || typeFullName.StartsWith("AppBoxClient.RxEntity<"))
                return VisitEntityObserve(node, methodSymbol);
        }

        return base.VisitInvocationExpression(node);
    }

    private InvocationExpressionSyntax VisitEntityObserve(InvocationExpressionSyntax node, IMethodSymbol symbol)
    {
        //方法参数暂只支持指向实体成员的表达式, eg: e => e.Name
        var arg = node.ArgumentList.Arguments[0];
        if (arg.Expression is not LambdaExpressionSyntax argLambda)
            throw new Exception("Only support LambdaExpression now.");
        if (argLambda.ExpressionBody is not MemberAccessExpressionSyntax memberAccess)
            throw new Exception("Only support MemberAccess now.");

        var propSymbol = (IPropertySymbol)SemanticModel.GetSymbolInfo(memberAccess).Symbol!;
        if (!propSymbol.ContainingType.IsAppBoxEntity(FindModel))
            throw new Exception("Must be a Entity");

        var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(propSymbol.ContainingType.ToString());
        if (modelNode == null)
            throw new Exception("Can't find EntityModel");
        var entityModel = (EntityModel)modelNode.Model;
        var memberName = memberAccess.Name.Identifier.Text;
        var member = entityModel.GetMember(memberName, false);
        if (member == null)
            throw new Exception($"Can't find entity member: {entityModel.Name}.{memberName}");

        var arg1 = SyntaxFactory.Argument(SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression,
            SyntaxFactory.Literal(member.MemberId)));
        var arg2 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"e=>e.{member.Name}"));
        var arg3 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"(e,v)=>e.{member.Name}=v"));
        var args = SyntaxFactory.ArgumentList().AddArguments(arg1, arg2, arg3);

        var expression = (ExpressionSyntax)node.Expression.Accept(this)!;
        return SyntaxFactory.InvocationExpression(expression, args);
    }
}