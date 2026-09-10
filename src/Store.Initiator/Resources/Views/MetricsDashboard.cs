namespace sys.Views;

public sealed class MetricsDashboard : View
{
    //TODO: share x Axis

    public MetricsDashboard()
    {
        FillColor = Colors.Black;
        Child = new Column().WithChildren([
                BuildCmdBar(),
                new Row().WithChildren([
                    BuildCard(BuildTopServiceSum()).WrapByExpanded(),
                    BuildCard(BuildTopServiceAvg()).WrapByExpanded(),
                ]).WrapByExpanded(),
                new Row().WithChildren([
                    BuildCard(BuildCpuUsage()).WrapByExpanded(),
                    BuildCard(BuildMemUsage()).WrapByExpanded()
                ]).WrapByExpanded(),
                new Row().WithChildren([
                    BuildCard(BuildThreadPoolCount()).WrapByExpanded(),
                    BuildCard(BuildGcCollections()).WrapByExpanded()
                ]).WrapByExpanded()
        ]);
    }

    private MetricPieChart _topServiceAvg = null!;
    private MetricPieChart _topServiceSum = null!;
    private MetricLineChart _cpuUsage = null!;
    private MetricLineChart _memUsage = null!;
    private MetricLineChart _threadPoolCount = null!;
    private MetricLineChart _gcCollections = null!;

    private readonly State<TimeSpan> _start = TimeSpan.FromHours(1);
    private readonly State<string> _end = string.Empty;
    private readonly State<TimeSpan> _resolution = TimeSpan.FromSeconds(30);
    private readonly State<Color> _whiteColor = Colors.White;
    private readonly TimeSpan[] _startOffsets =
    [
        TimeSpan.FromHours(1),
        TimeSpan.FromHours(4),
        TimeSpan.FromHours(8),
        TimeSpan.FromDays(1),
        TimeSpan.FromDays(2),
    ];
    private readonly TimeSpan[] _resolutions =
    [
        TimeSpan.FromSeconds(15),
        TimeSpan.FromSeconds(30),
        TimeSpan.FromMinutes(1),
        TimeSpan.FromMinutes(5),
        TimeSpan.FromMinutes(10),
        TimeSpan.FromMinutes(30),
    ];

    private Widget BuildCmdBar()
    {
        var row = new Row() { Spacing = 5 }.WithChildren([
            new Text("Start:") { TextColor = _whiteColor},
            new Select<TimeSpan>(_start) { Options = _startOffsets, LabelGetter = FormatTimeSpan }.WithWidth(100),
            new Text("End:") { TextColor = _whiteColor },
            new TextInput(_end) { HintText = "Now" }.WithWidth(150),
            new Text("Resolution:") { TextColor = _whiteColor},
            new Select<TimeSpan>(_resolution) { Options = _resolutions, LabelGetter = FormatTimeSpan }.WithWidth(60),
            new Expanded(),
            new Button(icon: MaterialIcons.Refresh) { OnTap = _ => Refresh() }
        ]);
        var container = new Container() { Padding = EdgeInsets.All(5), Height = 44 }
            .WithChild(row);
        return BuildCard(container);
    }

    private MetricLineChart BuildCpuUsage() => new MetricLineChart("CPU Usage", "cpu_mode",
            res => $"sum by (cpu_mode) (rate(dotnet_process_cpu_time_seconds_total[{res}s]))",
            v => v.ToString("P2")).RefBy(ref _cpuUsage);

    private MetricLineChart BuildMemUsage() => new MetricLineChart("Memory Usage", "WorkingSet",
            res => $"max(max_over_time(dotnet_process_memory_working_set_bytes[{res}s]))",
            FormatBytes).RefBy(ref _memUsage);

    private MetricLineChart BuildThreadPoolCount() => new MetricLineChart("ThreadPool Count", "Count",
            res => $"max(max_over_time(dotnet_thread_pool_thread_count_total[{res}s]))",
            v => v.ToString("F0")).RefBy(ref _threadPoolCount);

    private MetricLineChart BuildGcCollections() => new MetricLineChart("GC Collections", "gc_heap_generation",
            res => $"sum by (gc_heap_generation) (rate(dotnet_gc_collections_total[{res}s]))",
            v => $"{v:F2} ops", 0).RefBy(ref _gcCollections);

    private MetricPieChart BuildTopServiceAvg() => new MetricPieChart("TopService(P95)", "Method",
            range => $"topk(5, histogram_quantile(0.95, sum by (Method, le) (rate(InvokeDuration_bucket[{range}s]))))",
            //平均$"topk(5,sum(rate(InvokeDuration_sum[2h])) by (Method) / sum(rate(InvokeDuration_count[{range}s])) by (Method))"
            p => $"{p.Coordinate.PrimaryValue:F1}ms").RefBy(ref _topServiceAvg);

    private MetricPieChart BuildTopServiceSum() => new MetricPieChart("TopService(Sum)", "Method",
            range => $"topk(5,sum by (Method) (increase(InvokeDuration_sum[{range}s])))",
            p => $"{p.Coordinate.PrimaryValue / 100 :F1}s").RefBy(ref _topServiceSum);

    private Card BuildCard(Widget child) => new Card
    {
        Child = child,
        Color = Colors.Transparent,
        ShadowColor = Colors.White,
        Elevation = 5,
    };

    private static string FormatBytes(double bytes)
    {
        if (bytes < 0 || bytes == double.NaN)
            return bytes.ToString();

        string[] sizes = { "B", "K", "M", "G", "T" };
        double len = bytes;
        int order = 0;

        // 每次除以 1024，直到找到合适的单位
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }

        return $"{len:F1} {sizes[order]}";
    }

    private static string FormatTimeSpan(TimeSpan ts) => ts switch
    {
        { Days: > 0 } => $"{ts.Days}天",
        { Hours: > 0 } => $"{ts.Hours}时",
        { Minutes: > 0 } => $"{ts.Minutes}分",
        { Seconds: > 0 } => $"{ts.Seconds}秒",
        _ => ts.ToString()
    };

    private void Refresh()
    {
        var endTime = DateTime.Now;
        if (!string.IsNullOrEmpty(_end.Value) && DateTime.TryParse(_end.Value, out var time))
            endTime = time;

        TimeSpan startOffset = _start.Value;
        var startTime = endTime.Add(-startOffset);

        var resolution = (int)_resolution.Value.TotalSeconds;

        _topServiceAvg.Refresh(startTime, endTime);
        _topServiceSum.Refresh(startTime, endTime);
        _cpuUsage.Refresh(startTime, endTime, resolution);
        _memUsage.Refresh(startTime, endTime, resolution);
        _threadPoolCount.Refresh(startTime, endTime, resolution);
        _gcCollections.Refresh(startTime, endTime, resolution);
    }

}