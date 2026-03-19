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
        q.Where(t => t.F(nameof(Employee.Name)) == "Admin");
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
    public async Task ToScalarTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t.F(nameof(Employee.Name)) == "Admin");
        var name = await q.ToScalarAsync<string>(t => t.F("Name"));
        Assert.AreEqual("Admin", name);
    }

    [Test]
    public async Task ToSingleTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t.F(nameof(Employee.Name)) == "Admin");
        var entity = await q.ToSingleAsync();
        Assert.True(entity != null && entity.Name == "Admin");
    }

    [Test]
    public async Task ToListTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t.F(nameof(Employee.Name)) == "Admin");
        var list = await q.ToListAsync();
        Assert.True(list.Count == 1);
    }

    [Test]
    public async Task ToListDynamicTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.Where(t => t.F(nameof(Employee.Name)) == "Admin");
        var list = await q.ToListAsync(
            r => new { Id = r.ReadGuidMember(0), Name = r.ReadStringMember(1) },
            t => [t.F("Id"), t.F("Name")]);
        Assert.True(list.Count == 1);
        Assert.True(list[0].Name == "Admin");
    }

    [Test]
    public async Task ToDataTableTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        var ds = await q.ToDataTableAsync(
            r => new()
            {
                ["Name"] = r.ReadStringMember(0),
                ["Login"] = r.ReadNullableStringMember(1) ?? DataCell.Empty
            },
            [
                new("Name", DataType.String),
                new("Login", DataType.String)
            ],
            t => [t.F("Name"), t.F("Account")]);
        Assert.True(ds.Count > 0);
    }

    [Test]
    public async Task ToTreeTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        var tree = await q.ToTreeAsync(t => t.S(nameof(OrgUnit.Children), OrgUnit.MODELID));
        Assert.True(tree.Count == 1);
        Assert.True(ReferenceEquals(tree[0], tree[0].Children[0].Parent));
    }

    [Test]
    public async Task ToTreePathTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q.Where(t => t.F(nameof(OrgUnit.Name)) == "Admin");
        var path = await q.ToTreePathAsync(
            t => t.R(nameof(OrgUnit.Parent), OrgUnit.MODELID),
            t => t.F(nameof(OrgUnit.Name)));
        Assert.True(path != null);
        Console.WriteLine(path);
    }

    [Test]
    public async Task OrderByTest()
    {
        var q = new SqlQuery<Employee>(Employee.MODELID);
        q.OrderBy(e => e.F("Name"));
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
        var j = new SqlTable(Employee.MODELID);
        q.LeftJoin(j, (ou, emp) => ou.F("Id") == emp.F("Id"));

        var list = await q
            .Where(j, (ou, emp) => ou.F("BaseType") == Employee.MODELID & emp.F("Name") == "Admin")
            .ToListAsync(j,
                r => new { Id = r.ReadGuidMember(0), Name = r.ReadStringMember(1) },
                (ou, emp) => [ou.F("Id"), emp.F("Name")]);

        Assert.True(list.Count == 1);
        Assert.AreEqual("Admin", list[0].Name);
    }

    [Test]
    public async Task GroupByTest()
    {
        var q = new SqlQuery<Checkout>(Checkout.MODELID);
        q.GroupBy(t => t.F("NodeType"))
            .Having(t => SqlFunc.Sum(t.F("Version")) > 0);
        var list = await q.ToListAsync(
            r => new { NodeType = r.ReadByteMember(0), Count = r.ReadIntMember(1) },
            (t) => [t.F("NodeType"), SqlFunc.Sum(t.F("Version"))]);
        Assert.True(list.Count > 0);
    }

    [Test]
    public async Task IncludeEntityRefTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q.Include<OrgUnit>(t => t.R("Parent", OrgUnit.MODELID));
        q.Where(t => t.F("Name") == "Admin");
        var obj = await q.ToSingleAsync();
        Assert.NotNull(obj);
        Assert.NotNull(obj!.Parent);
        Assert.AreEqual("IT Dept", obj.Parent!.Name);
        Assert.AreEqual(PersistentState.Unchanged, obj.Parent.PersistentState);
    }

    [Test]
    public async Task IncludeEntitySetTest()
    {
        var q = new SqlQuery<OrgUnit>(OrgUnit.MODELID);
        q.Include<OrgUnit>(t => t.S("Children", OrgUnit.MODELID));
        q.Where(t => t.F("Name") == "IT Dept");
        var obj = await q.ToSingleAsync();
        Assert.NotNull(obj);
        Assert.NotNull(obj!.Children);
        Assert.Greater(obj.Children.Count, 0);
    }
}