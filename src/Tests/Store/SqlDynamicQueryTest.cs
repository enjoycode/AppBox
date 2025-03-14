using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;
using NUnit.Framework;

namespace Tests.Store;

public class SqlDynamicQueryTest
{
    static SqlDynamicQueryTest()
    {
        ServerRuntimeHelper.MockUserSession();
    }

    [Test]
    public async Task FetchTest()
    {
        var q = new DynamicQuery();
        var t = new EntityExpression(Employee.MODELID, null);
        q.ModelId = Employee.MODELID;
        q.Selects =
        [
            new("Name", t["Name"], DynamicFieldFlag.String),
            new("Birthday", t["Birthday"], DynamicFieldFlag.DateTime)
        ];
        q.Filter = t["Name"].Contains("Ad");
        q.Orders = [new DynamicQuery.OrderByItem(t["Name"])];

        var sq = new SqlDynamicQuery(q);
        var res = await sq.ToTableAsync();
        Assert.IsNotNull(res);
        Assert.IsTrue(res.Count > 0);
    }

    [Test]
    public async Task FetchSimpleTest()
    {
        var q = new DynamicQuerySimple();
        q.ModelId = Employee.MODELID;
        q.Selects =
        [
            new("Name", "t.Name", DynamicFieldFlag.String),
            new("Birthday", "t.Birthday", DynamicFieldFlag.DateTime)
        ];
        q.Orders = [new("t.Name")];
        q.Filters =
        [
            new DynamicQuerySimple.FilterItem("t.Name", BinaryOperatorType.Like, "Ad")
        ];

        var sq = new SqlDynamicQuery(q);
        var res = await sq.ToTableAsync();
        Assert.IsNotNull(res);
        Assert.IsTrue(res.Count > 0);
    }
}