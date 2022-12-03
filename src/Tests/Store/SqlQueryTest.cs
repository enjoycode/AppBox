using System;
using System.Reflection;
using System.Threading.Tasks;
using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;
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
        q.Where(t => t[nameof(Employee.Name)] == "Admin");
        var list = await q.ToListAsync();
        var src = list[0];

        var res = await SqlStore.Default.FetchAsync(new Employee(src.Id));
        Assert.IsNotNull(res);
        Assert.True(src.Name == res!.Name);
    }

    [Test]
    public async Task ToSingleTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t[nameof(Employee.Name)] == "Admin");
        var entity = await q.ToSingleAsync();
        Assert.True(entity != null && entity.Name == "Admin");
    }

    [Test]
    public async Task ToListTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t[nameof(Employee.Name)] == "Admin");
        var list = await q.ToListAsync();
        Assert.True(list.Count == 1);
    }

    [Test]
    public async Task ToTreeTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        var tree = await q.ToTreeAsync(t => t[nameof(OrgUnit.Children)]);
        Assert.True(tree.Count == 1);
        Assert.True(ReferenceEquals(tree[0], tree[0].Children[0].Parent));
    }

    [Test]
    public async Task ToTreePathTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q.Where(t => t[nameof(OrgUnit.Name)] == "Admin");
        var path = await q.ToTreePathAsync(t => t[nameof(OrgUnit.Parent)], t => t[nameof(OrgUnit.Name)]);
        Assert.True(path != null);
        Console.WriteLine(path);
    }
}