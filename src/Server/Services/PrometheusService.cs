using AppBoxCore;
using System.Text.Json;
using AppBoxCore.Metrics;

namespace AppBoxServer;

/// <summary>
/// Prometheus查询服务
/// </summary>
internal sealed class PrometheusService : IService
{
    //正式部署一般不会暴露Prometheus服务，所以需要中转数据至前端

    /// <summary>
    /// Prometheus服务器地址
    /// </summary>
    internal static string ServerUrl
    {
        set => _httpClient = new HttpClient()
        {
            BaseAddress = new Uri(value + "/api/v1/"),
            Timeout = TimeSpan.FromSeconds(10)
        };
    }

    private static HttpClient _httpClient = null!;

    internal static async Task<List<VectorResult>> Query(string promql, DateTime time)
    {
        var ts = (int)(time.ToUniversalTime() - DateTime.UnixEpoch).TotalSeconds;
        var fullUrl = $"query?query={Uri.EscapeDataString(promql)}&time={ts}";
        var data = await Run(fullUrl);
        return ((VectorData)data).Result;
    }

    internal static async Task<List<MatrixResult>> QueryRange(string promql, DateTime start, DateTime end, int step)
    {
        if (start >= end) throw new ArgumentOutOfRangeException();
        var ts1 = (int)(start.ToUniversalTime() - DateTime.UnixEpoch).TotalSeconds;
        var ts2 = (int)(end.ToUniversalTime() - DateTime.UnixEpoch).TotalSeconds;
        var fullUrl = $"query_range?query={Uri.EscapeDataString(promql)}&start={ts1}&end={ts2}&step={step}s";
        var data = await Run(fullUrl);
        return ((MatrixData)data).Result;
    }

    private static async Task<PrometheusData> Run(string url)
    {
        using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync();
        var result = await JsonSerializer.DeserializeAsync<PrometheusResponse>(stream);
        if (result.Status != "success")
            throw new Exception(result.Error);
        return result.Data;
    }

    public async ValueTask<AnyValue> InvokeAsync<T>(ReadOnlyMemory<char> method, T args) where T : struct, IAnyArgs
        => method.Span switch
        {
            //@formatter:off
            "Query" => AnyValue.From(await Query(args.GetString()!, args.GetDateTime()!.Value)),
            "QueryRange" => AnyValue.From(await QueryRange(args.GetString()!, 
                args.GetDateTime()!.Value, args.GetDateTime()!.Value, args.GetInt()!.Value)),
            _ => throw new Exception($"Can't find method: {method}")
            //@formatter:on
        };
}