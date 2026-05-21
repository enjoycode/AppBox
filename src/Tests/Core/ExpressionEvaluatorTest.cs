using System.Diagnostics;
using System.Runtime.CompilerServices;
using AppBoxCore;
using AppBoxDesign;
using AppBoxDesign.CodeGenerator;
using NUnit.Framework;

namespace Tests.Core;

public class ExpressionEvaluatorTest
{
    [Test]
    public async Task AwaitTest()
    {
        await MetadataReferences.InitAsync(new MockMetadataReferenceProvider());
        //var expLine = "await Task.Delay(500)";
        var expLine = "return await Task.FromResult(123)";
        var code =
            $"using System;using System.Threading.Tasks;static class E{{static async Task<int> M(){{{expLine};}}}}";
        var exp = ExpressionParser.ParseCode(code, true);

        // Task<int> task1 = Task.FromResult(123);
        // Task<object?> task2 =  task1;
        
        var evaluator = new ExpressionEvaluator();
        var context = new ExpressionEvalContext(ExpressionContext.Default);
        var ts = Stopwatch.GetTimestamp();
        var result = await evaluator.Visit(exp, context);
        Console.WriteLine($"{Stopwatch.GetElapsedTime(ts).TotalMilliseconds}ms");
        Console.WriteLine(result.BoxedValue);
    }
}