using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using AppBoxWebHost;
using NUnit.Framework;

namespace Tests.Store;

public sealed class SqlQueryTest
{
    static SqlQueryTest()
    {
        TestHelper.TryInitDefaultStore();
    }

    [Test]
    public async Task ToListTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(q.T["Name"] == "Admin");
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