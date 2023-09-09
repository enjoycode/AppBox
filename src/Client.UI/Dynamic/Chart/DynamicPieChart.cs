using LiveCharts;
using PixUI;

namespace AppBoxClient.Dynamic;

public sealed class DynamicPieChart : SingleChildWidget
{
    public DynamicPieChart()
    {
        Child = new PieChart();
    }
}