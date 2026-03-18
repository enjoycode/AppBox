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
            new("Name", t.F("Name"), DataType.String),
            new("Birthday", t.F("Birthday"), DataType.DateTime)
        ];
        q.Filter = t.F("Name").Contains("Ad");
        q.Orders = [new DynamicQuery.OrderByItem(t.F("Name"))];

        var sq = new SqlDynamicQuery(q);
        var res = await sq.ToDataTableAsync();
        Assert.IsNotNull(res);
        Assert.IsTrue(res.Count > 0);
        Assert.AreEqual(res[0]["Name"].StringValue, "Admin");
    }
    

    [Test]
    public void DynamicQuerySerializeTest()
    {
        var root = new EntityExpression(Employee.MODELID, null);

        var q1 = new DynamicQuery();
        q1.ModelId = root.ModelId;
        q1.Selects =
        [
            new("Id", root.F("Id"), DataType.Guid),
            new("Name", root.F("Name"), DataType.String),
        ];

        var data = SerializationTest.Serialize(q1);
        var q2 = (DynamicQuery)SerializationTest.Deserialize(data)!;
        Assert.NotNull(q2);
    }
}