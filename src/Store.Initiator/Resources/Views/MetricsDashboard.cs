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
                    BuildCard(BuildCpuUsage()).WrapByExpanded(),
                    BuildCard(BuildMemUsage()).WrapByExpanded()
                ]).WrapByExpanded(),
                new Row().WithChildren([
                    BuildCard(BuildThreadPoolCount()).WrapByExpanded(),
                    BuildCard(BuildGcCollections()).WrapByExpanded()
                ]).WrapByExpanded()
        ]);
    }

    private MetricLineChart _cpuUsage = null!;
    private MetricLineChart _memUsage = null!;
    private MetricLineChart _threadPoolCount = null!;
    private MetricLineChart _gcCollections = null!;

    private readonly State<string?> _start = "1Hour";
    private readonly State<string> _end = string.Empty;
    private readonly State<string?> _resolution = "30s";
    private readonly State<Color> _whiteColor = Colors.White;
    private readonly string[] _startOffsets = ["1Hour", "4Hour", "8Hour", "1Day", "2Day"];
    private readonly string[] _res = ["15s", "30s", "1m", "5m", "10m", "30m"];

    private Widget BuildCmdBar()
    {
        var row = new Row() { Spacing = 5 }.WithChildren([
            new Text("Start:") { TextColor = _whiteColor},
            new Select<string>(_start) { Options = _startOffsets }.WithWidth(100),
            new Text("End:") { TextColor = _whiteColor },
            new TextInput(_end) { HintText = "Now" }.WithWidth(150),
            new Text("Resolution:") { TextColor = _whiteColor},
            new Select<string>(_resolution) { Options = _res }.WithWidth(60),
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
            v => $"{v:F2} ops").RefBy(ref _gcCollections);

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

    private void Refresh()
    {
        var endTime = DateTime.Now;
        if (!string.IsNullOrEmpty(_end.Value) && DateTime.TryParse(_end.Value, out var time))
            endTime = time;

        TimeSpan startOffset = _start.Value switch
        {
            "4Hour" => TimeSpan.FromHours(4),
            "8Hour" => TimeSpan.FromHours(8),
            "1Day" => TimeSpan.FromDays(1),
            "2Day" => TimeSpan.FromDays(2),
            _ => TimeSpan.FromHours(1)
        };
        var startTime = endTime.Add(-startOffset);

        var res = _resolution.Value switch
        {
            "30s" => TimeSpan.FromSeconds(30),
            "1m" => TimeSpan.FromMinutes(1),
            "5m" => TimeSpan.FromMinutes(5),
            "10m" => TimeSpan.FromMinutes(10),
            "30m" => TimeSpan.FromMinutes(30),
            _ => TimeSpan.FromSeconds(15)
        };
        var resValue = (int)res.TotalSeconds;

        _cpuUsage.Refresh(startTime, endTime, resValue);
        _memUsage.Refresh(startTime, endTime, resValue);
        _threadPoolCount.Refresh(startTime, endTime, resValue);
        _gcCollections.Refresh(startTime, endTime, resValue);
    }

}