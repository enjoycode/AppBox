using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

namespace AppBoxDesign;

internal partial class ViewCodeGenerator
{
    public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
    {
        var methodSymbol = SemanticModel.GetSymbolInfo(node.Expression).Symbol as IMethodSymbol;
        //转换处理调用服务方法
        if (methodSymbol != null && methodSymbol.IsAppBoxServiceMethod())
            return VisitInvokeAppBoxService(node, methodSymbol);
        //转换处理Entity.Observe() or RxEntity.Observe()
        if (methodSymbol != null && methodSymbol.Name == "Observe")
        {
            var typeFullName = methodSymbol.ContainingType.ToString();
            if (typeFullName == "AppBoxClient.EntityExtensions" || typeFullName.StartsWith("AppBoxClient.RxEntity<"))
                return VisitEntityObserve(node, methodSymbol);
        }

        return base.VisitInvocationExpression(node);
    }

    private InvocationExpressionSyntax VisitInvokeAppBoxService(InvocationExpressionSyntax node, IMethodSymbol symbol)
    {
        //返回类型是Task<T>或Task
        var isReturnGenericTask = ((INamedTypeSymbol)symbol.ReturnType).IsGenericType;
        //需要检查返回类型内是否包含实体，是则加入引用模型列表内
        if (isReturnGenericTask)
            symbol.ReturnType.CheckTypeHasAppBoxModel(FindModel, AddUsedModel);

        //转换服务方法调用为 AppBoxClient.Channel.Invoke()
        var appName = symbol.ContainingNamespace.ContainingNamespace.Name;
        var servicePath = $"{appName}.{symbol.ContainingType.Name}.{symbol.Name}";
        var methodName = "AppBoxClient.Channel.Invoke";
        if (isReturnGenericTask)
        {
            var rt = ((INamedTypeSymbol)symbol.ReturnType).TypeArguments[0];
            methodName += $"<{rt}>";
        }

        var method = SyntaxFactory.ParseExpression(methodName);
        var serviceArg = SyntaxFactory.Argument(
            SyntaxFactory.LiteralExpression(SyntaxKind.StringLiteralExpression,
                SyntaxFactory.Literal(servicePath))
        );
        var args = SyntaxFactory.ArgumentList().AddArguments(serviceArg);
        if (node.ArgumentList.Arguments.Count == 0)
        {
            var nullArg = SyntaxFactory.Argument(
                SyntaxFactory.LiteralExpression(SyntaxKind.NullLiteralExpression));
            args = args.AddArguments(nullArg);
        }
        else
        {
            var nullableObjectType = SyntaxFactory.NullableType(
                SyntaxFactory.PredefinedType(SyntaxFactory.Token(SyntaxKind.ObjectKeyword)));
            var argsArrayType = SyntaxFactory.ArrayType(nullableObjectType,
                new SyntaxList<ArrayRankSpecifierSyntax>().Add(
                    SyntaxFactory.ArrayRankSpecifier(
                        SyntaxFactory.Token(SyntaxKind.OpenBracketToken),
                        new SeparatedSyntaxList<ExpressionSyntax>().Add(
                            SyntaxFactory.OmittedArraySizeExpression()),
                        SyntaxFactory.Token(SyntaxKind.CloseBracketToken))
                ));

            var sepList = SyntaxFactory.SeparatedList<ExpressionSyntax>();
            foreach (var argument in node.ArgumentList.Arguments)
            {
                sepList = sepList.Add(argument.Expression);
            }

            var argsArrayInitializer = SyntaxFactory.InitializerExpression(
                SyntaxKind.ArrayInitializerExpression,
                SyntaxFactory.Token(SyntaxKind.OpenBraceToken), sepList,
                SyntaxFactory.Token(SyntaxKind.CloseBraceToken));
            var argsArray = SyntaxFactory
                .ArrayCreationExpression(argsArrayType, argsArrayInitializer);

            args = args.AddArguments(SyntaxFactory.Argument(argsArray));
        }

        //entity factory arg
        if (isReturnGenericTask)
        {
            var entityFactories = SyntaxFactory.IdentifierName("_entityFactories");
            args = args.AddArguments(SyntaxFactory.Argument(entityFactories));
        }

        var res = SyntaxFactory.InvocationExpression(method, args).WithTriviaFrom(node);
        return res;
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
        var member = entityModel.GetMember(memberAccess.Name.Identifier.Text);


        var arg1 = SyntaxFactory.Argument(SyntaxFactory.LiteralExpression(SyntaxKind.NumericLiteralExpression,
            SyntaxFactory.Literal(member.MemberId)));
        var arg2 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"e=>e.{member.Name}"));
        var arg3 = SyntaxFactory.Argument(SyntaxFactory.ParseExpression($"(e,v)=>e.{member.Name}=v"));
        var args = SyntaxFactory.ArgumentList().AddArguments(arg1, arg2, arg3);

        var expression = (ExpressionSyntax)node.Expression.Accept(this)!;
        return SyntaxFactory.InvocationExpression(expression, args);
    }
}