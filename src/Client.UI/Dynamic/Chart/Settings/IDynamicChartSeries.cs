using AppBoxCore;
using AppBoxDesign;
using LiveChartsCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public interface IDynamicChartSeries : IBinSerializable
{
    ChartSeriesType SeriesType { get; }

    /// <summary>
    /// 生成运行时的Series
    /// </summary>
    IEnumerable<ISeries> Build(IDynamicContext dynamicContext, DataTable list);
}

public interface IDynamicCartesianSeries : IDynamicChartSeries
{
    string? Name { get; set; }
    string Field { get; set; }

    IDynamicCartesianSeries Clone();
}