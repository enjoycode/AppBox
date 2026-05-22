using AppBoxStore;
using AppBoxStore.Entities;
using BenchmarkDotNet.Attributes;
using Microsoft.EntityFrameworkCore;

namespace Tests;

public class SqlQueryBenchmark
{
    public SqlQueryBenchmark()
    {
        ServerRuntimeHelper.MockUserSession();
        _db = new TestDbContext();
    }
    
    private readonly TestDbContext _db;

    [Benchmark]
    public async Task SqlQuery_SimpleWhere()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t.F("Name") == "Admin");
        _ = await q.ToListAsync();
    }

    [Benchmark]
    public async Task SqlQuery_SimpleWhere_EF()
    {
        //await using var db = new TestDbContext();
        _ = await _db.Employees.AsNoTracking()
            .Where(t => t.Name == "Admin")
            .ToListAsync();
    }

    // M1 Pro Dotnet6
    // |                  Method |     Mean |   Error |   StdDev |    Gen0 | Allocated |
    // |------------------------ |---------:|--------:|---------:|--------:|----------:|
    // |    SqlQuery_SimpleWhere | 155.5 us | 3.68 us | 10.86 us |  2.4414 |   5.28 KB |
    // | SqlQuery_SimpleWhere_EF | 339.4 us | 5.61 us |  4.98 us | 25.3906 |  51.09 KB |
    
    // M1 Pro Dotnet10 (EF Core shared DbContext)
    //| Method                  | Mean     | Error    | StdDev   | Gen0   | Allocated |
    //|------------------------ |---------:|---------:|---------:|-------:|----------:|
    //| SqlQuery_SimpleWhere    | 79.52 us | 0.398 us | 0.311 us | 0.7324 |   5.02 KB |
    //| SqlQuery_SimpleWhere_EF | 90.54 us | 0.573 us | 0.536 us | 1.2207 |    8.7 KB |
    
}