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

    private const string CpuUsage = "sum by (cpu_mode) (rate(dotnet_process_cpu_time_seconds_total[30s]))";
    private const string MemUsage = "max(max_over_time(dotnet_process_memory_working_set_bytes[30s]))";

    private const string TopCall1 =
        "topk(3, sum by (Method) (rate(InvokeDuration_sum[10m])) / sum by (Method) (rate(InvokeDuration_count[10m])))";

    private const string TopCall2 =
        "topk(5, histogram_quantile(0.95, sum by (Method, le) (rate(InvokeDuration_bucket[2h]))))";
    
    //Garbage Collections
    //"sum by (gc_heap_generation) (rate(dotnet_gc_collections_total[1h]))"
    
    //GC Commited Memory Size
    //"max(max_over_time(process_runtime_dotnet_gc_committed_memory_size_bytes[1h]))"

    //GC Objects size
    //"max(max_over_time(process_runtime_dotnet_gc_objects_size[1h]))"
    
    //GC Allocation Size
    //"sum(rate(process_runtime_dotnet_gc_allocations_size[1h]))"
    
    //Thead Pool Threads
    //"max(max_over_time(dotnet_thread_pool_thread_count_total[1h]))",
    
    //Thread Pool Queue Length
    //"max(max_over_time(process_runtime_dotnet_thread_pool_queue_length[1h]))",


    [Test]
    public async Task QueryInstantTest()
    {
        var result = await PrometheusService.Query(TopCall2, DateTime.Now);
        Assert.NotNull(result);
    }

    [Test]
    public async Task QueryRangeTest()
    {
        //"histogram_quantile(0.95, sum by (service) (rate(http_request_duration_seconds_bucket[1h])))"
        var result =
            await PrometheusService.QueryRange(CpuUsage, DateTime.Now.AddHours(-1), DateTime.Now, 60);
        Assert.NotNull(result);
    }
}