using AppBoxStore;
using BenchmarkDotNet.Attributes;
using Microsoft.CodeAnalysis.Elfie.Serialization;
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
}