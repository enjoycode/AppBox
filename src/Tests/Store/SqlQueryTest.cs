using System;
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
        ServerRuntimeHelper.MockUserSession();
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
    public async Task CountTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        var count = await q.CountAsync();
        Assert.True(count > 0);
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
    public async Task ToListDynamicTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t[nameof(Employee.Name)] == "Admin");
        var list = await q.ToListAsync(r => new { Id = r.ReadGuidMember(0), Name = r.ReadStringMember(1) },
            t => [t["Id"], t["Name"]]);
        Assert.True(list.Count == 1);
        Assert.True(list[0].Name == "Admin");
    }

    [Test]
    public async Task ToDataSetTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        var ds = await q.ToDataSetAsync(
            r => new()
            {
                ["Name"] = r.ReadStringMember(0),
                ["Login"] = r.ReadNullableStringMember(1) ?? DynamicField.Empty
            },
            new DynamicFieldInfo[] { new("Name", DynamicFieldFlag.String), new("Login", DynamicFieldFlag.String) },
            t => new[] { t["Name"], t["Account"] });
        Assert.True(ds.Count > 0);
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

    [Test]
    public async Task OrderByTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.OrderBy(e => e["Name"]);
        await q.ToListAsync();
    }

    [Test]
    public async Task SkipTakeTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        // q.OrderBy(e => e["Name"]);
        q.Skip(1).Take(1);
        var list = await q.ToListAsync();
        Assert.True(list.Count == 1);
    }

    [Test]
    public async Task JoinTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        var j = new SqlQueryJoin(Employee.MODELID);
        q.LeftJoin(j, (ou, emp) => ou["Id"] == emp["Id"]);

        var list = await q
            .Where(j, (ou, emp) => ou["BaseType"] == Employee.MODELID & emp["Name"] == "Admin")
            .ToListAsync(j,
                r => new { Id = r.ReadGuidMember(0), Name = r.ReadStringMember(1) },
                (ou, emp) => new[] { ou["Id"], emp["Name"] });

        Assert.True(list.Count == 1);
        Assert.AreEqual("Admin", list[0].Name);
    }

    [Test]
    public async Task GroupByTest()
    {
        var q = new SqlQuery<Checkout>(Checkout.MODELID);
        q.GroupBy(t => t["NodeType"])
            .Having(t => SqlFunc.Sum(t["Version"]) > 0);
        var list = await q.ToListAsync(
            r => new { NodeType = r.ReadByteMember(0), Count = r.ReadIntMember(1) },
            (t) => new[] { t["NodeType"], SqlFunc.Sum(t["Version"]) });
    }
}