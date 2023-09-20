using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

partial class ViewCsGenerator
{
    public override SyntaxNode? VisitObjectCreationExpression(ObjectCreationExpressionSyntax node)
    {
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (!_forPreview)
        {
            if (TryEmitLazyRoute(node, symbol?.ContainingType, out var newNode))
                return newNode;
        }
        
        if (TryEmitDynamicWidget(node, symbol?.ContainingType, out var newDynamicNode))
            return newDynamicNode;

        return base.VisitObjectCreationExpression(node);
    }

    public override SyntaxNode? VisitImplicitObjectCreationExpression(ImplicitObjectCreationExpressionSyntax node)
    {
        var symbol = SemanticModel.GetSymbolInfo(node).Symbol;
        if (!_forPreview)
        {
            if (TryEmitLazyRoute(node, symbol?.ContainingType, out var newLazyRoute))
                return newLazyRoute;
        }

        if (TryEmitDynamicWidget(node, symbol?.ContainingType, out var newDynamicNode))
            return newDynamicNode;

        return base.VisitImplicitObjectCreationExpression(node);
    }

    private bool TryEmitLazyRoute(BaseObjectCreationExpressionSyntax node, INamedTypeSymbol? typeSymbol,
        out ObjectCreationExpressionSyntax? newNode)
    {
        newNode = null;
        if (!(typeSymbol != null && typeSymbol.Name == "Route" && typeSymbol.ContainingNamespace.Name == "PixUI"))
            return false;

        //new Route()的第二个参数仅支持Lambda表达式且具备ExpressionBody
        if (node.ArgumentList!.Arguments[1].Expression is not LambdaExpressionSyntax lambdaArg
            || lambdaArg.ExpressionBody == null)
            return false;
        //继续判断lambda body返回的是否视图模型
        var lambdaReturnSymbol = ModelExtensions.GetTypeInfo(SemanticModel, lambdaArg.ExpressionBody).Type;
        if (lambdaReturnSymbol == null || lambdaReturnSymbol is not INamedTypeSymbol returnSymbol ||
            returnSymbol.ContainingNamespace.Name != "Views") return false;
        var viewModelNode = DesignHub.DesignTree.FindModelNodeByFullName(lambdaReturnSymbol.ToString());
        if (viewModelNode == null) return false;
        if (((ViewModel)viewModelNode.Model).ViewType == ViewModelType.PixUIDynamic)
            return false; //排除动态视图模型

        //TODO:将LazyLoad的路由加入特定的依赖列表后待处理，因目前BuildApp时处理所有视图模型暂无影响

        var newArgs = SyntaxFactory.ArgumentList();
        for (var i = 0; i < node.ArgumentList.Arguments.Count; i++)
        {
            if (i == 1)
            {
                var viewModelName = $"{viewModelNode.AppNode.Model.Name}.{viewModelNode.Model.Name}";
                var arg = SyntaxFactory.Argument(
                    SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
                        SyntaxFactory.Literal(viewModelName)));
                newArgs = newArgs.AddArguments(arg);
            }
            else
            {
                newArgs = newArgs.AddArguments((ArgumentSyntax)VisitArgument(node.ArgumentList.Arguments[i]));
            }
        }

        var lazyRouteType = SyntaxFactory.ParseTypeName("PixUI.LazyRoute");
        newNode = SyntaxFactory.ObjectCreationExpression(lazyRouteType, newArgs, null);
        return true;
    }

    private bool TryEmitDynamicWidget(BaseObjectCreationExpressionSyntax node, INamedTypeSymbol? typeSymbol,
        out ObjectCreationExpressionSyntax? newNode)
    {
        newNode = null;
        if (typeSymbol == null || !typeSymbol.IsAppBoxView(FindModel)) return false;

        var viewModelNode = DesignHub.DesignTree.FindModelNodeByFullName(typeSymbol.ToString());
        var viewModel = (ViewModel)viewModelNode!.Model;
        if (viewModel.ViewType != ViewModelType.PixUIDynamic) return false;

        long modelId = viewModel.Id;
        var newArgs = SyntaxFactory.ArgumentList();
        var modelIdArg = SyntaxFactory.Argument(
            SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression, SyntaxFactory.Literal(modelId))
        );
        newArgs = newArgs.AddArguments(modelIdArg);

        //TODO:处理动态状态属性初始化

        var dynamicWidgetType = SyntaxFactory.ParseTypeName("PixUI.DynamicWidget");
        newNode = SyntaxFactory.ObjectCreationExpression(dynamicWidgetType, newArgs, null);
        return true;
    }
}