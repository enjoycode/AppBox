using System.Diagnostics.CodeAnalysis;
using BenchmarkDotNet.Attributes;

namespace Tests;

[SuppressMessage("ReSharper", "NotAccessedVariable")]
public class DynamicBenchmark
{
    public class Person
    {
        public int Age { get; set; }
    }

    private const int Iterations = 5_000_000;
    private static readonly Person Person1 = new Person();
    private static readonly dynamic DynamicPerson = Person1;

    [Benchmark]
    public void DirectCall()
    {
        var sum = 0;
        for (var i = 0; i < Iterations; i++)
        {
            sum += Person1.Age;
        }
    }

    [Benchmark]
    public void Dynamic()
    {
        var sum = 0;
        for (var i = 0; i < Iterations; i++)
        {
            sum += DynamicPerson.Age;
        }
    }

    [Benchmark]
    public void Reflection()
    {
        var sum = 0;
        for (var i = 0; i < Iterations; i++)
        {
            sum += (int)typeof(Person).GetProperty("Age")!.GetValue(Person1)!;
        }
    }

    [Benchmark]
    public void ReflectionCached()
    {
        var propInfo = typeof(Person).GetProperty("Age")!;
        var sum = 0;
        for (var i = 0; i < Iterations; i++)
        {
            sum += (int)propInfo.GetValue(Person1)!;
        }
    }

    // M1Pro DotNet10
    // | Method           | Mean      | Error     | StdDev    | Gen0       | Allocated   |
    // |----------------- |----------:|----------:|----------:|-----------:|------------:|
    // | DirectCall       |  1.555 ms | 0.0033 ms | 0.0029 ms |          - |           - |
    // | Dynamic          | 52.249 ms | 0.2409 ms | 0.2136 ms | 38200.0000 | 240000000 B |
    // | Reflection       | 89.184 ms | 0.3412 ms | 0.2664 ms | 19000.0000 | 120000549 B |
    // | ReflectionCached | 41.199 ms | 0.1322 ms | 0.1172 ms | 19076.9231 | 120000211 B |
}