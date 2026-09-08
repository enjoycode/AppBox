using AppBoxServer;
using NUnit.Framework;

namespace Tests.Server;

public class PrometheusServiceTest
{
    [SetUp]
    public static void Setup()
    {
        PrometheusService.ServerUrl = "http://localhost:9090";
    }

    [Test]
    public async Task QueryInstantTest()
    {
        var qml =
            "topk(3, sum by (Method) (rate(InvokeDuration_sum[10m])) / sum by (Method) (rate(InvokeDuration_count[10m])))";
        var result = await PrometheusService.Query(qml, DateTime.Now);
        Assert.NotNull(result);
    }

    [Test]
    public async Task QueryRangeTest()
    {
        //"histogram_quantile(0.95, sum by (service) (rate(http_request_duration_seconds_bucket[1h])))"

        var qml =
            "topk(3, sum by (Method) (rate(InvokeDuration_sum[10m])) / sum by (Method) (rate(InvokeDuration_count[10m])))";
        var result =
            await PrometheusService.QueryRange(qml, DateTime.Now.AddHours(-1), DateTime.Now, 60);
        Assert.NotNull(result);
    }
}