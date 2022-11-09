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
    
    // 1. use struct SqlRowReader, but will box
    // |                  Method |     Mean |   Error |  StdDev |    Gen0 | Allocated |
    // |------------------------ |---------:|--------:|--------:|--------:|----------:|
    // |    SqlQuery_SimpleWhere | 153.3 us | 3.04 us | 6.06 us |  2.6855 |   5.42 KB |
    // | SqlQuery_SimpleWhere_EF | 297.2 us | 1.66 us | 1.55 us | 25.3906 |  51.28 KB |
    // 2. after use thread cache for SqlRowReader
    // |                  Method |     Mean |   Error |  StdDev |    Gen0 | Allocated |
    // |------------------------ |---------:|--------:|--------:|--------:|----------:|
    // |    SqlQuery_SimpleWhere | 146.4 us | 2.92 us | 3.90 us |  2.4414 |   5.29 KB |
    // | SqlQuery_SimpleWhere_EF | 296.7 us | 2.25 us | 2.10 us | 25.3906 |  51.11 KB |
}