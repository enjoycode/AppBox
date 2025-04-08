using AppBoxCore;
using AppBoxStore;
using AppBoxStore.Entities;
using NUnit.Framework;
using Tests.Core;

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
            new("Name", t["Name"], DataType.String),
            new("Birthday", t["Birthday"], DataType.DateTime)
        ];
        q.Filter = t["Name"].Contains("Ad");
        q.Orders = [new DynamicQuery.OrderByItem(t["Name"])];

        var sq = new SqlDynamicQuery(q);
        var res = await sq.ToDataTableAsync();
        Assert.IsNotNull(res);
        Assert.IsTrue(res.Count > 0);
        Assert.AreEqual(res[0]["Name"].StringValue, "Admin");
    }

    [Test]
    public async Task FetchSimpleTest()
    {
        var q = new DynamicQuerySimple();
        q.ModelId = Employee.MODELID;
        q.Selects =
        [
            new("Name", "t.Name", DataType.String),
            new("Birthday", "t.Birthday", DataType.DateTime)
        ];
        q.Orders = [new("t.Name")];
        q.Filters = [new DynamicQuerySimple.FilterItem("t.Name", BinaryOperatorType.Like, "Ad")];

        var sq = new SqlDynamicQuery(q);
        var res = await sq.ToDataTableAsync();
        Assert.IsNotNull(res);
        Assert.IsTrue(res.Count > 0);
    }


    [Test]
    public void DynamicQuerySerializeTest()
    {
        var root = new EntityExpression(Employee.MODELID, null);

        var q1 = new DynamicQuery();
        q1.ModelId = root.ModelId;
        q1.Selects =
        [
            new("Id", root["Id"], DataType.Guid),
            new("Name", root["Name"], DataType.String),
        ];

        var data = SerializationTest.Serialize(q1);
        var q2 = (DynamicQuery)SerializationTest.Deserialize(data)!;
        Assert.NotNull(q2);
    }
}