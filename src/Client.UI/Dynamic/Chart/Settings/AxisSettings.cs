using System.Threading.Tasks;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class AxisSettings
{
    public string? Name { get; set; }

    public string? DataSet { get; set; }

    /// <summary>
    /// 数据集的标签字段
    /// </summary>
    public string? Labels { get; set; }

    /// <summary>
    /// 标签自定义格式化模版(暂保留)
    /// </summary>
    public string? Formatter { get; set; }

    public double? MinStep { get; set; }

    public bool ForceStepToMin { get; set; }

    public double? TextSize { get; set; }

    public AxisSettings Clone() => new()
    {
        Name = Name, DataSet = DataSet, Labels = Labels, Formatter = Formatter,
        MinStep = MinStep, ForceStepToMin = ForceStepToMin, TextSize = TextSize
    };

    public async ValueTask<LiveCharts.Axis> Buid(IDynamicView dynamicView)
    {
        var res = new LiveCharts.Axis();
        // if (!string.IsNullOrEmpty(Formatter))
        // {
        //     res.Labeler = v => string.Format(null, Formatter, v);
        // }

        if (TextSize.HasValue) res.TextSize = TextSize.Value;
        if (MinStep.HasValue) res.MinStep = MinStep.Value;
        if (ForceStepToMin)
        {
            if (!MinStep.HasValue) res.MinStep = 1;
            res.ForceStepToMin = ForceStepToMin;
        }

        if (!string.IsNullOrEmpty(DataSet) && !string.IsNullOrEmpty(Labels))
        {
            var ds = (DynamicDataSet?)(await dynamicView.GetDataSet(DataSet));
            res.Labeler = v =>
            {
                var index = (int)v;
                if (ds == null || index < 0 || index >= ds.Count)
                    return string.Empty;

                return ds[index][Labels].ToStringValue();
            };
        }

        return res;
    }
}