using System;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;
using LinqExp = System.Linq.Expressions.Expression;

namespace Tests.Design;

public class ExpressionParserTest
{
    private static object? Run(string expLine)
    {
        var code = $"using System;static class E{{static object? M(){{return {expLine};}}}}";
        var exp = ExpressionParser.ParseCode(code);
        //var expString = exp.ToString();
        var body = exp.ToLinqExpression(ExpressionContext.Default)!;
        var lambda = LinqExp.Lambda<Func<object?>>(LinqExp.Convert(body, typeof(object)));
        var func = lambda.Compile();
        return func();
        
        // var lambda = FastExp.Lambda<Func<DateTime>>(exp.ToLinqExpression(ctx));
        // var func = lambda.CompileFast();
    }

    [Test]
    public void LinqTest()
    {
        //System.Linq.Expressions.Expression<Func<DateTime>> exp = () => DateTime.Today.AddDays(-1);

        System.Linq.Expressions.Expression<Func<int,DateTime>> exp = input => DateTime.Today.AddDays(-input);
        //DateTime.Today.AddDays(Convert(-input, Double))
    }
    
    [Test]
    public void StaticPropertyTest() => Run("DateTime.Today");

    [Test]
    public void MethodCallTest() => Run("DateTime.Today.AddDays(1)");

    [Test]
    public void PrefixUnaryTest() => Run("DateTime.Today.AddDays(-1)");
}