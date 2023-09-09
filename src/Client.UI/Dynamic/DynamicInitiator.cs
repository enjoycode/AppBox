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
                }));
        DynamicWidgetManager.Register(
            DynamicWidgetMeta.Make<DynamicPieChart>(MaterialIcons.PieChart,
                catalog: "Chart",
                name: "PieChart"));
    }

    public static void TryInit() { }
}