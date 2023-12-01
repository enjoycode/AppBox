using System.Threading.Tasks;
using AppBoxCore;
using LiveCharts.Painting;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic;

public sealed class ChartAxisSettings
{
    public string? Name { get; set; }

    /// <summary>
    /// 数据集的标签字段
    /// </summary>
    public string? Labels { get; set; }

    public Color? LabelsColor { get; set; }

    /// <summary>
    /// 标签自定义格式化模版(暂保留)
    /// </summary>
    public string? Formatter { get; set; }

    public double? MinStep { get; set; }

    public bool ForceStepToMin { get; set; }

    public double? TextSize { get; set; }

    public ChartAxisSettings Clone() => new()
    {
        Name = Name, Labels = Labels,
        LabelsColor = LabelsColor, Formatter = Formatter,
        MinStep = MinStep, ForceStepToMin = ForceStepToMin, TextSize = TextSize
    };

    public LiveCharts.Axis Buid(IDynamicView dynamicView, DynamicDataSet dataset)
    {
        var res = new LiveCharts.Axis();
        // if (!string.IsNullOrEmpty(Formatter))
        // {
        //     res.Labeler = v => string.Format(null, Formatter, v);
        // }

        if (TextSize.HasValue) res.TextSize = TextSize.Value;
        if (LabelsColor.HasValue) res.LabelsPaint = new SolidColorPaint { Color = LabelsColor.Value };
        if (MinStep.HasValue) res.MinStep = MinStep.Value;
        if (ForceStepToMin)
        {
            if (!MinStep.HasValue) res.MinStep = 1;
            res.ForceStepToMin = ForceStepToMin;
        }

        if (!string.IsNullOrEmpty(Labels))
        {
            res.Labeler = v =>
            {
                var index = (int)v;
                if (index < 0 || index >= dataset.Count)
                    return string.Empty;

                return dataset[index][Labels].ToStringValue();
            };
        }

        return res;
    }
}