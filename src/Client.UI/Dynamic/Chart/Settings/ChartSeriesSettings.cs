using System.Text.Json.Serialization;
using System.Threading.Tasks;
using LiveChartsCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public abstract class ChartSeriesSettings
{
    [JsonIgnore] public abstract string Type { get; }

    /// <summary>
    /// 对应的数据集名称
    /// </summary>
    public string DataSet { get; set; } = null!;

    /// <summary>
    /// 对应数据集的字段名
    /// </summary>
    public string Field { get; set; } = null!;

    /// <summary>
    /// 显示名称，如无等于FieldName，eg: "销售额"
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// 生成运行时的Series
    /// </summary>
    public abstract Task<ISeries> Build(IDynamicView dynamicView);
}