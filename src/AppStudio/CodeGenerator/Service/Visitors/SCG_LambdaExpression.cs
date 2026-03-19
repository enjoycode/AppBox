using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal partial class ServiceCodeGenerator
{
    public override SyntaxNode? VisitSimpleLambdaExpression(SimpleLambdaExpressionSyntax node)
    {
        if (_queryMethodCtx.HasAny)
        {
            var currentQuery = _queryMethodCtx.Current;
            currentQuery.LambdaParameters = [node.Parameter];
            currentQuery.InLambdaExpression = true;

            SyntaxNode? res;
            if (currentQuery.IsDynamicMethod)
                res = VisitDynamicQuery(node, currentQuery);
            else if (currentQuery.MethodName == QueryMethods.AsSubQuery)
                res = VisitAsSubQuery(node, currentQuery);
            else
                res = base.VisitSimpleLambdaExpression(node);

            currentQuery.InLambdaExpression = false;
            return res;
        }

        return base.VisitSimpleLambdaExpression(node);
    }

    public override SyntaxNode? VisitParenthesizedLambdaExpression(ParenthesizedLambdaExpressionSyntax node)
    {
        if (_queryMethodCtx.HasAny)
        {
            var currentQuery = _queryMethodCtx.Current;
            currentQuery.LambdaParameters = node.ParameterList.Parameters.ToArray();
            currentQuery.InLambdaExpression = true;

            SyntaxNode? res;
            if (currentQuery.IsDynamicMethod)
                res = VisitDynamicQuery(node, currentQuery);
            else if (currentQuery.MethodName == QueryMethods.AsSubQuery)
                res = VisitAsSubQuery(node, currentQuery);
            else
                res = base.VisitParenthesizedLambdaExpression(node);

            currentQuery.InLambdaExpression = false;
            return res;
        }

        return base.VisitParenthesizedLambdaExpression(node);
    }

    private SyntaxNode VisitDynamicQuery(LambdaExpressionSyntax lambda, QueryMethod queryMethod)
    {
        switch (lambda.Body)
        {
            case AnonymousObjectCreationExpressionSyntax aoc:
                return queryMethod.MethodName == QueryMethods.ToDataTableAsync
                    ? VisitDynamicQueryToDataTable(lambda, queryMethod.LambdaParameters!, aoc)
                    : VisitDynamicQueryToAnonymousObject(lambda, queryMethod.LambdaParameters!, aoc);
            case MemberAccessExpressionSyntax ma:
                return VisitDynamicQueryToSingleValue(lambda, queryMethod.LambdaParameters!, ma);
            case ObjectCreationExpressionSyntax oc:
                return VisitDynamicQueryToObject(lambda, queryMethod.LambdaParameters!, oc);
            default:
                throw new NotImplementedException($"Lambda body [{lambda.Body.GetType().Name}] is not implemented.");
        }
    }

    private SyntaxNode VisitDynamicQueryToDataTable(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, AnonymousObjectCreationExpressionSyntax aoc)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //1. 转换Lambda表达式为运行时Lambda表达式
        //eg: t=>new {t.Id, t.Name} 转换为 r=> new() {"Id" = r.ReadIntMember(0), "Name"=r.ReadStringMember(1)}
        var sb1 = StringBuilderCache.Acquire();
        var sb2 = StringBuilderCache.Acquire();
        sb1.Append("r => new() {");
        sb2.Append("new DataColumn[] {");
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
            var expType = TypeHelper.GetSymbolType(expSymbol!);
            var typeString = TypeHelper.GetEntityMemberTypeString(expType!, out var isNullable);
            if (isNullable) sb1.Append("Nullable");
            sb1.Append(typeString);
            sb1.Append("Member(");
            sb1.Append(i);
            sb1.Append(')');
            if (isNullable)
                sb1.Append(" ?? DataCell.Empty");

            sb2.Append($"new(\"{fieldName}\", DataType.{typeString})");
        }

        sb1.Append('}');
        sb2.Append('}');
        //转换为参数并加入参数列表
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb1))
        ));

        //2. 参数2 DataColumn[]
        args = args.Add(SyntaxFactory.Argument(
            SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb2))
        ));

        //3. 转换lambda with AnonymousObject
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(aoc.Initializers.Select(init => (ExpressionSyntax)init.Expression.Accept(this)!));
        var selectsArg = LambdaToArgument(lambda, lambdaParameters, arrayItems);
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitDynamicQueryToAnonymousObject(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, AnonymousObjectCreationExpressionSyntax aoc)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //1. 转换Lambda表达式为运行时Lambda表达式
        //eg: t=>new {t.Id, t.Name} 转换为 r=> new {Id=r.ReadIntMember(0), Name=r.ReadStringMember(1)}
        var sb = StringBuilderCache.Acquire();
        sb.Append("r => new {");
        for (var i = 0; i < aoc.Initializers.Count; i++)
        {
            if (i != 0) sb.Append(',');
            var initializer = aoc.Initializers[i];
            if (initializer.NameEquals != null)
                sb.Append(initializer.NameEquals.Name.Identifier.ValueText);
            else //没有命名需要指定成员名称 t.Name 转换为 Name = t.F("Name")
                sb.Append(((MemberAccessExpressionSyntax)initializer.Expression).Name.Identifier.ValueText);
            sb.Append("=r.Read");
            var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, initializer.Expression).Symbol;
            var expType = TypeHelper.GetSymbolType(expSymbol!);
            var typeString = TypeHelper.GetEntityMemberTypeString(expType!, out var isNullable);
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

        //2. 转换lambda with AnonymousObject
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(aoc.Initializers.Select(init => (ExpressionSyntax)init.Expression.Accept(this)!));
        var selectsArg = LambdaToArgument(lambda, lambdaParameters, arrayItems);
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitDynamicQueryToObject(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, ObjectCreationExpressionSyntax oc)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //1. 转换Lambda表达式为运行时Lambda表达式
        //eg: t=>new XXX{t.Id, t.Name} 转换为 r=> new XXX{Id=r.ReadIntMember(0), Name=r.ReadStringMember(1)}
        var sb = StringBuilderCache.Acquire();
        sb.Append("r => new ");
        sb.Append(oc.Type);
        sb.Append('{');
        for (var i = 0; i < oc.Initializer!.Expressions.Count; i++)
        {
            if (i != 0) sb.Append(',');
            var initializer = oc.Initializer.Expressions[i];
            var assigment = (AssignmentExpressionSyntax)initializer;
            sb.Append(assigment.Left);

            sb.Append("=r.Read");
            var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, assigment.Left).Symbol;
            var expType = TypeHelper.GetSymbolType(expSymbol!);
            var typeString = TypeHelper.GetEntityMemberTypeString(expType!, out var isNullable);
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

        //2. 处理selectItems参数
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(oc.Initializer.Expressions
                .Select(init => (ExpressionSyntax)((AssignmentExpressionSyntax)init).Right.Accept(this)!));
        var selectsArg = LambdaToArgument(lambda, lambdaParameters, arrayItems);
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode VisitDynamicQueryToSingleValue(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, MemberAccessExpressionSyntax ma)
    {
        var args = new SeparatedSyntaxList<ArgumentSyntax>();
        //1. 转换Lambda表达式为运行时Lambda表达式
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

        //2. 处理selectItems参数
        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .Add((ExpressionSyntax)ma.Accept(this)!);
        var selectsArg = LambdaToArgument(lambda, lambdaParameters, arrayItems);
        args = args.Add(selectsArg);

        return SyntaxFactory.ArgumentList(args);
    }

    private SyntaxNode? VisitAsSubQuery(LambdaExpressionSyntax lambda, QueryMethod queryMethod)
    {
        if (lambda.Body is MemberAccessExpressionSyntax)
        {
            return lambda switch
            {
                SimpleLambdaExpressionSyntax simple => base.VisitSimpleLambdaExpression(simple),
                ParenthesizedLambdaExpressionSyntax parenthesized => base.VisitParenthesizedLambdaExpression(
                    parenthesized),
                _ => base.Visit(lambda)
            };
        }

        if (lambda.Body is not AnonymousObjectCreationExpressionSyntax aoc)
            throw new NotImplementedException($"AsSubQuery lambda can't accept {lambda.Body.GetType()}");

        var arrayItems = new SeparatedSyntaxList<ExpressionSyntax>()
            .AddRange(aoc.Initializers.Select(init => (ExpressionSyntax)init.Expression.Accept(this)!));
        return ConvertLambdaSelects(queryMethod.LambdaParameters!, arrayItems).WithTriviaFrom(lambda);
    }


    private static ArgumentSyntax LambdaToArgument(LambdaExpressionSyntax lambda,
        ParameterSyntax[] lambdaParameters, SeparatedSyntaxList<ExpressionSyntax> array)
    {
        var selectsLambda = ConvertLambdaSelects(lambdaParameters, array);
        var selectsArg = SyntaxFactory.Argument(selectsLambda);

        //补行差
        if (lambda.Body is MemberAccessExpressionSyntax)
        {
            selectsArg = selectsArg.WithTriviaFrom(lambda.Body);
        }
        else
        {
            var lineSpan = lambda.Body.GetLocation().GetLineSpan();
            var lineDiff = lineSpan.EndLinePosition.Line - lineSpan.StartLinePosition.Line;
            if (lineDiff > 0)
                selectsArg = selectsArg.WithTrailingTrivia(SyntaxFactory.Whitespace(new string('\n', lineDiff)));
        }

        return selectsArg;
    }

    /// <summary>
    /// 1. 将t=>new {ID=t.ID, Name=t.Name} 转换为 t=> [t.F("ID"), t.F("Name")]
    /// 2. 将t=>new XXX {ID=t.ID, Name=t.Name} 转换为 t=> [t.F("ID"), t.F("Name)]
    /// 3. 将t=>t.ID 转换为 t=>[t.F("ID")]
    /// </summary>
    private static ParenthesizedLambdaExpressionSyntax ConvertLambdaSelects(ParameterSyntax[] lambdaParameters,
        SeparatedSyntaxList<ExpressionSyntax> array)
    {
        var arrayInitializer = SyntaxFactory.InitializerExpression(SyntaxKind.ArrayInitializerExpression, array);
        var selectsArray = SyntaxFactory.ImplicitArrayCreationExpression(arrayInitializer);

        var parametersList = new SeparatedSyntaxList<ParameterSyntax>().AddRange(lambdaParameters);
        var selectsLambdaParameters = SyntaxFactory.ParameterList(parametersList);
        return SyntaxFactory.ParenthesizedLambdaExpression(selectsLambdaParameters, null, selectsArray);
    }
}