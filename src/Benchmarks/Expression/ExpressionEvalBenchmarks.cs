using System.Reflection.Emit;
using BenchmarkDotNet.Attributes;
using LinqExpression = System.Linq.Expressions.Expression;
using FastExpressionCompiler;
using FastExpressionCompiler.LightExpression;
using LightExpression = FastExpressionCompiler.LightExpression.Expression;

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
    public void UseLightExpression()
    {
        var taskInstance = LightExpression.Constant(_task);
        var resultMember = LightExpression.Property(taskInstance, "Result");
        var converter = LightExpression.Convert(resultMember, typeof(object));
        var lambda = LightExpression.Lambda<Func<object?>>(converter);
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
        _ = getter(_task);
    }

    // M1Pro Dotnet10
    // | Method             | Mean          | Error        | StdDev       | Gen0   | Gen1   | Allocated |
    // |------------------- |--------------:|-------------:|-------------:|-------:|-------:|----------:|
    // | UseExpression      | 199,381.18 ns | 3,277.401 ns | 3,065.683 ns | 0.4883 | 0.2441 |    4401 B |
    // | UseFastExpression  | 185,588.75 ns | 3,547.114 ns | 3,317.973 ns |      - |      - |    1408 B |
    // | UseLightExpression | 185,112.80 ns | 2,033.214 ns | 1,802.391 ns | 0.2441 |      - |    1631 B |
    // | UseReflection      |      26.61 ns |     0.023 ns |     0.020 ns | 0.0038 |      - |      24 B |
    // | UseEmit            | 172,439.91 ns | 1,283.415 ns | 1,137.714 ns |      - |      - |    1296 B |
}