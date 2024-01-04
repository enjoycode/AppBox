using System;
using System.Collections.Generic;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;
using LinqExp = System.Linq.Expressions.Expression;
using LinqExps = System.Linq.Expressions;

namespace Tests.Design;

public class ExpressionParserTest
{
    private static T Run<T>(string expLine)
    {
        var code = $"using System;static class E{{static {typeof(T).FullName} M(){{return {expLine};}}}}";
        var exp = ExpressionParser.ParseCode(code);
        var body = exp.ToLinqExpression(ExpressionContext.Default)!;
        if (body.Type != typeof(T))
            body = LinqExp.Convert(body, typeof(T));
        var lambda = LinqExp.Lambda<Func<T>>(body);
        var func = lambda.Compile();
        return func();

        // var lambda = FastExp.Lambda<Func<DateTime>>(exp.ToLinqExpression(ctx));
        // var func = lambda.CompileFast();
    }

    [Test]
    public void LinqTest()
    {
        //LinqExps.Expression<Func<object>> exp = () => DateTime.Today.Year;
        //LinqExps.Expression<Func<DateTime>> exp = () => DateTime.Today.AddDays(-1);

        //LinqExps.Expression<Func<int,DateTime>> exp = input => DateTime.Today.AddDays(-input);
        //DateTime.Today.AddDays(Convert(-input, Double))

        //LinqExps.Expression<Func<object>> exp = () => new { Name = "Rick" };
        //LinqExps.Expression<Func<object>> exp = () => new List<string>();

        //LinqExps.Expression<Func<int, float, object>> exp = (a, b) => a >= b;
        //LinqExps.Expression<Func<int, DateTime>> exp = v => DateTime.Today.AddDays(v + 2);
        LinqExps.Expression<Func<bool>> exp = () => Equals(new DateTime(1977, 3, 16), new DateTime(1977, 3, 16));

        var func = exp.Compile();
    }

    [Test]
    public void StaticPropertyTest() => Run<object>("DateTime.Today");

    [Test]
    public void InstancePropertyTest() => Run<int>("DateTime.Today.Year");

    [Test(Description = "方法参数是Binary且需要转换")]
    public void MethodCallTest1() => Run<DateTime>("DateTime.Today.AddDays(1 + 1)");

    [Test(Description = "方法参数是MemberAccess且需要转换")]
    public void MethodCallTest2() => Run<DateTime>("DateTime.Today.AddDays(DateTime.Today.Year)");

    [Test(Description = "方法参数是MethodCall且需要转换")]
    public void MethodCallTest3() => Run<DateTime>("DateTime.Today.AddDays(int.Parse(\"1\"))");

    [Test(Description = "方法参数是New且需要转换")]
    public void MethodCallTest4() => Assert.True(Run<bool>("Equals(new DateTime(1977,3,1), new DateTime(1977,3,1))"));

    [Test(Description = "PrefixUnary如果是Literal直接转换为Constant")]
    public void PrefixUnaryTest() => Run<DateTime>("DateTime.Today.AddDays(-1)");

    [Test]
    public void NewTest() => Assert.True(Run<DateTime>("new DateTime(1977,3,16)") == new DateTime(1977, 3, 16));

    [Test]
    public void BinaryTest1() => Assert.True(Run<float>("3 + 2.6f") == 3 + 2.6f);

    [Test]
    public void BinaryTest2() => Assert.True(Run<bool>("3 >= 2.6f"));
}