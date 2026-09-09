namespace sys.Views;

public sealed class MetricsDashboard : View
{
    public MetricsDashboard()
    {
        FillColor = Colors.Black;
        Child = new Column
        {
            Children =
            [
                new Row
                {
                    Children =
                    [
                        BuildCard(new CpuUsage()).WrapByExpanded(),
                        BuildCard(new MemUsage()).WrapByExpanded(),
                    ]
                }.WrapByExpanded() ,
                new Row
                {
                    Children =
                    [
                        BuildCard(new ThreadPoolCount()).WrapByExpanded(),
                        BuildCard(new GcCollections()).WrapByExpanded()
                    ]
                }.WrapByExpanded()
            ]
        };
    }

    private Card BuildCard(Widget child) => new Card
    {
        Child = child,
        Color = Colors.Transparent,
        ShadowColor = Colors.White,
        Elevation = 5,
    };

}