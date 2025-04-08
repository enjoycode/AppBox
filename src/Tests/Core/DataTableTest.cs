using AppBoxCore;
using NUnit.Framework;

namespace Tests.Core;

public sealed class DataTableTest
{
    [Test]
    public void DataRowTest()
    {
        int? v = null;
        DataRow obj = new()
        {
            ["Name"] = "Rick",
            ["Score"] = v //?? DataCell.Empty,
        };

        string? name = obj["Name"];
        int? score = obj["Score"];
        Assert.True(score == null);

        obj["Score"] = 100;
        score = obj["Score"];
        Assert.True(name == "Rick");
        Assert.True(score == 100);
    }

    [Test]
    public void DataTableSerializeTest()
    {
        var ds1 = new DataTable([
            new("Name", DataType.String),
            new("Score", DataType.Int)
        ]);
        ds1.Add(new()
        {
            ["Name"] = "Rick",
            ["Score"] = 100,
        });

        var data = SerializationTest.Serialize(ds1);

        var ds2 = (DataTable)SerializationTest.Deserialize(data)!;

        Assert.True(ds1.Count == ds2.Count);
        Assert.True((string)ds1[0]["Name"]! == (string)ds2[0]["Name"]!);
    }
}