using System;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;
using LinqExp = System.Linq.Expressions.Expression;

namespace Tests.Design;

public class ExpressionParserTest
{
    [Test]
    public void ParseTest()
    {
        const string code = """
                            using System;
                            public static class Expression
                            {
                                public static object? Method()
                                {
                                    return System.DateTime.Now;
                                }
                            }
                            """;

        var exp = ExpressionParser.ParseCode(code);
        //var expString = exp.ToString();
        var ctx = new ExpressionContext();
        var body = exp.ToLinqExpression(ctx)!;
        var lambda = LinqExp.Lambda<Func<DateTime>>(body);
        var func = lambda.Compile();
        var res = func();

        // var lambda = FastExp.Lambda<Func<DateTime>>(exp.ToLinqExpression(ctx));
        // var func = lambda.CompileFast();
        // var res = func();
        Assert.True(res.Year == DateTime.Today.Year);
    }
}