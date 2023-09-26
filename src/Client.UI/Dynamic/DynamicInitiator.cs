using AppBoxCore;
using LiveChartsCore;
using LiveChartsCore.Measure;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicInitiator
{
    static DynamicInitiator()
    {
        DynamicWidgetManager.Register<DynamicCartesianChart>(MaterialIcons.BarChart,
            catalog: "Chart",
            name: "CartesianChart",
            properties: new DynamicPropertyMeta[]
            {
                new("Series", typeof(CartesianSeriesSettings[]), true),
                new("XAxes", typeof(AxisSettings[]), true),
                new("YAxes", typeof(AxisSettings[]), true)
            });
        DynamicWidgetManager.Register<DynamicPieChart>(MaterialIcons.PieChart,
            catalog: "Chart",
            name: "PieChart",
            properties: new DynamicPropertyMeta[]
            {
                new("Series", typeof(PieSeriesSettings), true),
                new("LegendPosition", typeof(LegendPosition), false),
            });
    }

    public static void TryInit() { }
}