using AppBoxCore;
using LiveChartsCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class DynamicInitiator
{
    static DynamicInitiator()
    {
        DynamicWidgetManager.Register(
            DynamicWidgetMeta.Make<DynamicCartesianChart>(MaterialIcons.BarChart,
                catalog: "Chart",
                name: "CartesianChart",
                properties: new DynamicPropertyMeta[]
                {
                    new("Series", typeof(CartesianSeriesSettings[]), true),
                    new("XAxes", typeof(AxisSettings[]), true),
                    new("YAxes", typeof(AxisSettings[]), true)
                }));
        DynamicWidgetManager.Register(
            DynamicWidgetMeta.Make<DynamicPieChart>(MaterialIcons.PieChart,
                catalog: "Chart",
                name: "PieChart",
                properties: new DynamicPropertyMeta[]
                {
                    new("Series", typeof(PieSeriesSettings), true),
                }));
    }

    public static void TryInit() { }
}