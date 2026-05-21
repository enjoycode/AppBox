using System.Reflection.Emit;
using BenchmarkDotNet.Attributes;
using LinqExpression = System.Linq.Expressions.Expression;
using FastExpressionCompiler;

namespace Tests;

public class ExpressionEvalBenchmarks
{
    private readonly Task<int> _task = Task.FromResult(123);

    [Benchmark]
    public void UseExpression()
    {
        var taskInstance = LinqExpression.Constant(_task);
        var resultMember = LinqExpression.Property(taskInstance, "Result");
        var converter = LinqExpression.Convert(resultMember, typeof(object));
        var lambda = LinqExpression.Lambda<Func<object?>>(converter);
        var compiled = lambda.Compile();
        _ = compiled();
    }

    [Benchmark]
    public void UseFastExpression()
    {
        var taskInstance = LinqExpression.Constant(_task);
        var resultMember = LinqExpression.Property(taskInstance, "Result");
        var converter = LinqExpression.Convert(resultMember, typeof(object));
        var lambda = LinqExpression.Lambda<Func<object?>>(converter);
        var compiled = lambda.CompileFast();
        _ = compiled();
    }

    [Benchmark]
    public void UseReflection()
    {
        var taskType = _task.GetType();
        _ = taskType.GetProperty("Result")!.GetValue(_task);
    }

    [Benchmark]
    public void UseEmit()
    {
        var propInfo = _task.GetType().GetProperty("Result")!;
        DynamicMethod dynamicMethod = new DynamicMethod(string.Empty, typeof(object), [typeof(object)],
            propInfo.DeclaringType!.Module);
        ILGenerator ilGenerator = dynamicMethod.GetILGenerator();
        ilGenerator.Emit(OpCodes.Ldarg_0);
        ilGenerator.EmitCall(OpCodes.Callvirt, propInfo.GetGetMethod()!, null);
        if (propInfo.PropertyType.IsValueType)
            ilGenerator.Emit(OpCodes.Box, propInfo.PropertyType);
        ilGenerator.Emit(OpCodes.Ret);

        var getter = (Func<object?, object?>)dynamicMethod.CreateDelegate(typeof(Func<object?, object?>));
        getter(_task);
    }

    // M1Pro Dotnet10
    // | Method            | Mean          | Error        | StdDev       | Gen0   | Gen1   | Allocated |
    // |------------------ |--------------:|-------------:|-------------:|-------:|-------:|----------:|
    // | UseExpression     | 199,958.92 ns | 2,159.172 ns | 1,914.050 ns | 0.4883 | 0.2441 |    4401 B |
    // | UseFastExpression | 186,665.20 ns | 2,801.209 ns | 2,483.198 ns |      - |      - |    1328 B |
    // | UseReflection     |      26.28 ns |     0.108 ns |     0.101 ns | 0.0038 |      - |      24 B |
    // | UseEmit           | 174,363.87 ns | 1,993.591 ns | 1,664.738 ns |      - |      - |    1296 B |
}