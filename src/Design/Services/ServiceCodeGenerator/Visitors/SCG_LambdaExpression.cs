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
            if (queryMethodCtx.Current.IsIncludeMethod) //暂Include类特殊处理
            {
                queryMethodCtx.Current.InLambdaExpression = true;
                var res = base.VisitSimpleLambdaExpression(node);
                queryMethodCtx.Current.InLambdaExpression = false;
                return res;
            }

            queryMethodCtx.Current.LambdaParameters![0] = node.Parameter.Identifier.ValueText;
            //TODO:考虑预先处理 t=> 行差
            return VisitQueryMethodLambdaExpresssion(node);
        }

        return base.VisitSimpleLambdaExpression(node);
    }

    public override SyntaxNode? VisitParenthesizedLambdaExpression(
        ParenthesizedLambdaExpressionSyntax node)
    {
        if (queryMethodCtx.HasAny)
        {
            if (queryMethodCtx.Current.IsIncludeMethod) //暂Include类特殊处理
            {
                queryMethodCtx.Current.InLambdaExpression = true;
                var res = base.VisitParenthesizedLambdaExpression(node);
                queryMethodCtx.Current.InLambdaExpression = false;
                return res;
            }

            for (var i = 0; i < node.ParameterList.Parameters.Count; i++)
            {
                queryMethodCtx.Current.LambdaParameters![i] =
                    node.ParameterList.Parameters[i].Identifier.ValueText;
            }

            //TODO:考虑预先处理 (t)=> 行差
            return VisitQueryMethodLambdaExpresssion(node);
        }

        return base.VisitParenthesizedLambdaExpression(node);
    }

    private SyntaxNode VisitQueryMethodLambdaExpresssion(LambdaExpressionSyntax lambda)
    {
        queryMethodCtx.Current.InLambdaExpression = true;
        SyntaxNode res;
        if (queryMethodCtx.Current.IsDynamicMethod)
        {
            //注意处理行差
            var args = new SeparatedSyntaxList<ArgumentSyntax>();
            if (lambda.Body is AnonymousObjectCreationExpressionSyntax aoc)
            {
                //转换Lambda表达式为运行时Lambda表达式
                //eg: t=>new {t.Id, t.Name} 转换为 r=> new {Id=r.GetInt(0), Name=r.GetString(1)}
                var sb = StringBuilderCache.Acquire();
                sb.Append("r => new {");
                for (var i = 0; i < aoc.Initializers.Count; i++)
                {
                    if (i != 0) sb.Append(',');
                    var initializer = aoc.Initializers[i];
                    if (initializer.NameEquals != null)
                        sb.Append(initializer.NameEquals.Name.Identifier.ValueText);
                    else
                        sb.Append(((MemberAccessExpressionSyntax)initializer.Expression).Name
                            .Identifier.ValueText);
                    sb.Append("=r.Get");
                    var expSymbol = ModelExtensions
                        .GetSymbolInfo(SemanticModel, initializer.Expression).Symbol;
                    var expType = TypeHelper.GetSymbolType(expSymbol);
                    var typeString =
                        TypeHelper.GetEntityMemberTypeString(expType, out var isNullable);
                    if (isNullable) sb.Append("Nullable");
                    sb.Append(typeString);
                    sb.Append('(');
                    sb.Append(i);
                    sb.Append(')');
                }

                sb.Append('}');
                //转换为参数并加入参数列表
                args = args.Add(SyntaxFactory.Argument(
                    SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb))
                ));

                //处理selectItems参数
                for (var i = 0; i < aoc.Initializers.Count; i++)
                {
                    var initializer = aoc.Initializers[i];
                    var argExpression = (ExpressionSyntax)initializer.Expression.Accept(this);
                    if (initializer.NameEquals !=
                        null) //TODO:***检查是否还需要转换为SelectAs("XXX")，因前面已按序号获取
                    {
                        var selectAsMethodName =
                            (SimpleNameSyntax)SyntaxFactory.ParseName("SelectAs");
                        var selectAsMethod = SyntaxFactory.MemberAccessExpression(
                            SyntaxKind.SimpleMemberAccessExpression, argExpression,
                            selectAsMethodName);
                        var selectAsArgs = SyntaxFactory.ParseArgumentList(
                            $"(\"{initializer.NameEquals.Name.Identifier.ValueText}\")");
                        argExpression =
                            SyntaxFactory.InvocationExpression(selectAsMethod, selectAsArgs);
                    }

                    var arg = SyntaxFactory.Argument(argExpression);
                    //最后一个参数补body所有行差
                    if (i == aoc.Initializers.Count - 1)
                    {
                        var lineSpan = lambda.Body.GetLocation().GetLineSpan();
                        var lineDiff = lineSpan.EndLinePosition.Line -
                                       lineSpan.StartLinePosition.Line;
                        if (lineDiff > 0)
                            arg = arg.WithTrailingTrivia(
                                SyntaxFactory.Whitespace(new string('\n', lineDiff)));
                    }

                    args = args.Add(arg);
                }
            }
            else if (lambda.Body is MemberAccessExpressionSyntax ma)
            {
                //转换Lambda表达式为运行时Lambda表达式
                //eg: t=> t.Name 转换为 r=> r.GetString(0)
                var sb = StringBuilderCache.Acquire();
                sb.Append("r => r.Get");
                var expSymbol = ModelExtensions.GetSymbolInfo(SemanticModel, ma).Symbol;
                var expType = TypeHelper.GetSymbolType(expSymbol);
                var typeString = TypeHelper.GetEntityMemberTypeString(expType, out bool isNullable);
                if (isNullable) sb.Append("Nullable");
                sb.Append(typeString);
                sb.Append("(0)");
                //转换为参数并加入参数列表
                args = args.Add(SyntaxFactory.Argument(
                    SyntaxFactory.ParseExpression(StringBuilderCache.GetStringAndRelease(sb))
                ));

                //处理selectItems参数
                var argExpression = (ExpressionSyntax)ma.Accept(this);
                args = args.Add(SyntaxFactory.Argument(argExpression).WithTriviaFrom(ma));
            }
            else
            {
                throw new NotImplementedException(
                    $"动态查询方法的第一个参数[{lambda.Body.GetType().Name}]暂未实现");
            }

            res = SyntaxFactory.ArgumentList(args);
        }
        else if (queryMethodCtx.Current.MethodName == "ToScalarAsync")
        {
            var args = new SeparatedSyntaxList<ArgumentSyntax>();
            var argExpression = (ExpressionSyntax)lambda.Body.Accept(this);
            var arg = SyntaxFactory.Argument(argExpression);
            args = args.Add(arg);
            res = SyntaxFactory.ArgumentList(args);
        }
        else
        {
            res = Visit(lambda.Body);
        }

        queryMethodCtx.Current.InLambdaExpression = false;
        return res;
    }
}