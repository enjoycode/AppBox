using System.Text.Json;
using AppBoxClient.Dynamic;
using NUnit.Framework;

namespace Tests.ClientUI;

public class ChartSeriesSerializationTest
{
    [Test]
    public void Test1()
    {
        var json = """
                   [
                     {
                       "Series": "Line",
                       "Smoothness": null,
                       "Fill": true,
                       "DataSource": "orders",
                       "Field": "Sales",
                       "Name": null
                     },
                     {
                       "Series": "Line",
                       "Smoothness": 0,
                       "Fill": false,
                       "DataSource": "orders",
                       "Field": "Amount",
                       "Name": null
                     }
                   ]
                   """;

        var res = JsonSerializer.Deserialize(json, typeof(CartesianSeriesSettings[]));
        Assert.True(res != null);
    }
}