using System.Reflection.Emit;
using BenchmarkDotNet.Attributes;
using LinqExpression = System.Linq.Expressions.Expression;

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
    // | Method        | Mean          | Error        | StdDev       | Gen0   | Gen1   | Allocated |
    // |-------------- |--------------:|-------------:|-------------:|-------:|-------:|----------:|
    // | UseExpression | 199,494.80 ns | 2,465.067 ns | 2,305.825 ns | 0.4883 | 0.2441 |    4401 B |
    // | UseReflection |      26.76 ns |     0.094 ns |     0.079 ns | 0.0038 |      - |      24 B |
    // | UseEmit       | 172,473.06 ns | 2,432.484 ns | 2,275.347 ns |      - |      - |    1296 B |
}