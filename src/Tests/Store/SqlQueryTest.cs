using System;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using NUnit.Framework;

namespace Tests.Store;

public sealed class SqlQueryTest
{
    static SqlQueryTest()
    {
        TestHelper.TryInitDefaultStore();
    }

    [Test]
    public async Task FetchTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t["Name"] == "Admin");
        var list = await q.ToListAsync();
        var src = list[0];

        var res = await SqlStore.Default.FetchAsync(new Employee(src.Id));
        Assert.IsNotNull(res);
        Assert.True(src.Name == res!.Name);
    }

    [Test]
    public async Task ToListTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t["Name"] == "Admin");
        var list = await q.ToListAsync();
        Assert.True(list.Count == 1);
    }

    [Test]
    public async Task ToTreeTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        var tree = await q.ToTreeAsync(t => t["Children"]);
        Assert.True(tree.Count == 1);
    }
}