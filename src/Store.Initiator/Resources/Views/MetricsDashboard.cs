namespace sys.Views;

public sealed class MetricsDashboard : View
{
    public MetricsDashboard()
    {
        FillColor = Colors.Black;
        Child = new Column().WithChildren([
            BuildCmdBar(),
            new Row().WithChildren([
                BuildCard(new CpuUsage()).WrapByExpanded(),
                BuildCard(new MemUsage()).WrapByExpanded()
            ]).WrapByExpanded(),
            new Row().WithChildren([
                BuildCard(new ThreadPoolCount()).WrapByExpanded(),
                BuildCard(new GcCollections()).WrapByExpanded()
            ]).WrapByExpanded()
        ]);
    }

    private Widget BuildCmdBar()
    {
        var row = new Row() { Spacing = 5 }.WithChildren([
            new Text("Start:") { TextColor = Colors.White},
            new DatePicker(DateTime.Now).WithWidth(120),
            new Text("End:") { TextColor = Colors.White},
            new DatePicker(DateTime.Now).WithWidth(120),
            new Expanded(),
            new Button(icon: MaterialIcons.Refresh)
        ]);
        var container = new Container() { Padding = EdgeInsets.All(5), Height = 44 }
            .WithChild(row);
        return BuildCard(container);
    }

    private Card BuildCard(Widget child) => new Card
    {
        Child = child,
        Color = Colors.Transparent,
        ShadowColor = Colors.White,
        Elevation = 5,
    };

}