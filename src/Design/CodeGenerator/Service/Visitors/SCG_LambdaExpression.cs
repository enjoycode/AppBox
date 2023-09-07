using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
    {
        if (queryMethodCtx.HasAny)
        {
            var currentQuery = queryMethodCtx.Current;
            currentQuery.LambdaParameters = new[] { node.Parameter };
            currentQuery.InLambdaExpression = true;

            SyntaxNode? res;
            if (currentQuery.IsDynamicMethod)
                res = VisitDynamicQuery(node, currentQuery);
            else if (currentQuery.MethodName == "ToScalarAsync")
                res = VisitToScalarQuery(node);
            else
                res = base.VisitSimpleLambdaExpression(node);

            currentQuery.InLambdaExpression = false;
            return res;
        }

        return base.VisitSimpleLambdaExpression(node);
    }

    public override SyntaxNode? VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
    {
        if (queryMethodCtx.HasAny)
        {
            var currentQuery = queryMethodCtx.Current;
            currentQuery.LambdaParameters = node.ParameterList.Parameters.ToArray();
            currentQuery.InLambdaExpression = true;

            SyntaxNode? res;
            if (currentQuery.IsDynamicMethod)
                res = VisitDynamicQuery(node, currentQuery);
            else if (currentQuery.MethodName == "ToScalarAsync")
                res = VisitToScalarQuery(node);
            else
                res = base.VisitParenthesizedLambdaExpression(node);

            currentQuery.InLambdaExpression = false;
            return res;
        }

        return base.VisitParenthesizedLambdaExpression(node);
    }

    private SyntaxNode VisitDynamicQuery(LambdaExpressionSyntax lambda, QueryMethod queryMethod)
    {
        return lambda.Body switch
        {
            AnonymousObjectCreationExpressionSyntax aoc => queryMethod.MethodName == "ToDataSetAsync"
                ? VisitDynamicQueryToDataSet(lambda, queryMethod.LambdaParameters!, aoc)
                : VisitDynamicQueryToAnonymousObject(lambda, queryMethod.LambdaParameters!, aoc),
            MemberAccessExpressionSyntax ma =>
                VisitDynamicQueryToSingleValue(lambda, queryMethod.LambdaParameters!, ma),
            _ => throw new NotImplementedException($"动态查询方法的第一个参数[{lambda.Body.GetType().Name}]暂未实现")
        };
    }

    private SyntaxNode VisitDynamicQueryToDataSet(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, AnonymousObjectCreationExpressionSyntax aoc)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //1. 转换Lambda表达式为运行时Lambda表达式
        //eg: t=>new {t.Id, t.Name} 转换为 r=> new() {"Id" = r.ReadIntMember(0), "Name"=r.ReadStringMember(1)}
        var sb1 = StringBuilderCache.Acquire();
        var sb2 = StringBuilderCache.Acquire();
        sb1.Append("r => new() {");
        sb2.Append("new DynamicFieldInfo[] {");
        for (var i = 0; i < aoc.Initializers.Count; i++)
        {
            if (i != 0)
            {
                sb1.Append(',');
                sb2.Append(',');
            }

            var initializer = aoc.Initializers[i];
            var fieldName = initializer.NameEquals != null
                ? initializer.NameEquals.Name.Identifier.ValueText
                : ((MemberAccessExpressionSyntax)initializer.Expression).Name.Identifier.ValueText;
            
            sb1.Append("[\"");
            sb1.Append(fieldName);
            sb1.Append("\"]=r.Read");
            var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, initializer.Expression).Symbol;
            var expType = TypeHelper.GetSymbolType(expSymbol);
            var typeString = TypeHelper.GetEntityMemberTypeString(expType, out var isNullable);
            if (isNullable) sb1.Append("Nullable");
            sb1.Append(typeString);
            sb1.Append("Member(");
            sb1.Append(i);
            sb1.Append(')');
            if (isNullable)
                sb1.Append(" ?? DynamicField.Empty");

            sb2.Append($"new(\"{fieldName}\", DynamicFieldFlag.{typeString})");
        }

        sb1.Append('}');
        sb2.Append('}');
        //转换为参数并加入参数列表
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb1))
        ));

        //2. 参数2 DynamicFieldInfo[]
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb2))
        ));

        //3. 处理selectItems参数
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(aoc.Initializers.Select(init => (ExpressionSyntax)init.Expression.Accept(this)!));

        var arrayInitializer = SyntaxFactory.InitializerExpression(SyntaxKind.ArrayInitializerExpression, arrayItems);
        var selectsArray = SyntaxFactory.ImplicitArrayCreationExpression(arrayInitializer);

        var parametersList = new SeparatedSyntaxList<ParameterSyntax>().AddRange(lambdaParameters);
        var selectsLambdaParameters = SyntaxFactory.ParameterList(parametersList);
        var selectsLambda = SyntaxFactory.ParenthesizedLambdaExpression(selectsLambdaParameters, null, selectsArray);
        var selectsArg = SyntaxFactory.Argument(selectsLambda);

        //补body所有行差
        var lineSpan = lambda.Body.GetLocation().GetLineSpan();
        var lineDiff = lineSpan.EndLinePosition.Line - lineSpan.StartLinePosition.Line;
        if (lineDiff > 0)
            selectsArg = selectsArg.WithTrailingTrivia(SyntaxFactory.Whitespace(new string('\n', lineDiff)));
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitDynamicQueryToAnonymousObject(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, AnonymousObjectCreationExpressionSyntax aoc)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //转换Lambda表达式为运行时Lambda表达式
        //eg: t=>new {t.Id, t.Name} 转换为 r=> new {Id=r.ReadIntMember(0), Name=r.ReadStringMember(1)}
        var sb = StringBuilderCache.Acquire();
        sb.Append("r => new {");
        for (var i = 0; i < aoc.Initializers.Count; i++)
        {
            if (i != 0) sb.Append(',');
            var initializer = aoc.Initializers[i];
            if (initializer.NameEquals != null)
                sb.Append(initializer.NameEquals.Name.Identifier.ValueText);
            else //没有命名需要指定成员名称 t.Name 转换为 Name = t["Name"]
                sb.Append(((MemberAccessExpressionSyntax)initializer.Expression).Name.Identifier.ValueText);
            sb.Append("=r.Read");
            var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, initializer.Expression).Symbol;
            var expType = TypeHelper.GetSymbolType(expSymbol);
            var typeString = TypeHelper.GetEntityMemberTypeString(expType, out var isNullable);
            if (isNullable) sb.Append("Nullable");
            sb.Append(typeString);
            sb.Append("Member(");
            sb.Append(i);
            sb.Append(')');
        }

        sb.Append('}');
        //转换为参数并加入参数列表
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb))
        ));

        //处理selectItems参数
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(aoc.Initializers.Select(init => (ExpressionSyntax)init.Expression.Accept(this)!));

        var arrayInitializer = SyntaxFactory.InitializerExpression(SyntaxKind.ArrayInitializerExpression, arrayItems);
        var selectsArray = SyntaxFactory.ImplicitArrayCreationExpression(arrayInitializer);

        var parametersList = new SeparatedSyntaxList<ParameterSyntax>().AddRange(lambdaParameters);
        var selectsLambdaParameters = SyntaxFactory.ParameterList(parametersList);
        var selectsLambda = SyntaxFactory.ParenthesizedLambdaExpression(selectsLambdaParameters, null, selectsArray);
        var selectsArg = SyntaxFactory.Argument(selectsLambda);
        //补body所有行差
        var lineSpan = lambda.Body.GetLocation().GetLineSpan();
        var lineDiff = lineSpan.EndLinePosition.Line - lineSpan.StartLinePosition.Line;
        if (lineDiff > 0)
            selectsArg = selectsArg.WithTrailingTrivia(SyntaxFactory.Whitespace(new string('\n', lineDiff)));
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitDynamicQueryToSingleValue(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, MemberAccessExpressionSyntax ma)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //转换Lambda表达式为运行时Lambda表达式
        //eg: t=> t.Name 转换为 r=> r.ReadStringMember(0)
        var sb = StringBuilderCache.Acquire();
        sb.Append("r => r.Read");
        var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, ma).Symbol!;
        var expType = TypeHelper.GetSymbolType(expSymbol);
        var typeString = TypeHelper.GetEntityMemberTypeString(expType!, out var isNullable);
        if (isNullable) sb.Append("Nullable");
        sb.Append(typeString);
        sb.Append("Member(0)");
        //转换为参数并加入参数列表
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb))
        ));

        //处理selectItems参数
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .Add((ExpressionSyntax)ma.Accept(this)!);

        var arrayInitializer =
            SyntaxFactory.InitializerExpression(SyntaxKind.ArrayInitializerExpression, arrayItems);
        var selectsArray = SyntaxFactory.ImplicitArrayCreationExpression(arrayInitializer);

        var parametersList = new SeparatedSyntaxList<ParameterSyntax>().AddRange(lambdaParameters);
        var selectsLambdaParameters = SyntaxFactory.ParameterList(parametersList);
        var selectsLambda =
            SyntaxFactory.ParenthesizedLambdaExpression(selectsLambdaParameters, null, selectsArray);

        args = args.Add(SyntaxFactory.Argument(selectsLambda).WithTriviaFrom(ma));

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitToScalarQuery(LambdaExpressionSyntax lambda)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        var argExpression = (ExpressionSyntax)lambda.Body.Accept(this)!;
        var arg = SyntaxFactory.Argument(argExpression);
        args = args.Add(arg);
        return SyntaxFactory.ArgumentList(args);
    }
}