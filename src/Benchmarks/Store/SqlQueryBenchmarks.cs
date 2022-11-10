using AppBoxStore;
using AppBoxStore.Entities;
using BenchmarkDotNet.Attributes;
using Microsoft.EntityFrameworkCore;

namespace Tests;

public class SqlQueryBenchmarks
{
    public SqlQueryBenchmarks()
    {
        TestHelper.TryInitDefaultStore();
    }

    [Benchmark]
    public Task SqlQuery_SimpleWhere()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t["Name"] == "Admin");
        return q.ToListAsync();
    }

    [Benchmark]
    public async Task SqlQuery_SimpleWhere_EF()
    {
        await using var db = new TestDbContext();
        var _ = await db.Employees.Where(t => t.Name == "Admin").ToListAsync();
    }
    
    // M1 Pro Dotnet6
    // |                  Method |     Mean |   Error |   StdDev |    Gen0 | Allocated |
    // |------------------------ |---------:|--------:|---------:|--------:|----------:|
    // |    SqlQuery_SimpleWhere | 155.5 us | 3.68 us | 10.86 us |  2.4414 |   5.28 KB |
    // | SqlQuery_SimpleWhere_EF | 339.4 us | 5.61 us |  4.98 us | 25.3906 |  51.09 KB |
}