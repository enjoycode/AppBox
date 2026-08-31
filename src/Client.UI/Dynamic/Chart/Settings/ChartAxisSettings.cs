using AppBoxDesign;
using PixUI;
using PixUI.Dynamic;
using SolidColorPaint = PixUI.LiveCharts.Painting.SolidColorPaint;

namespace AppBoxClient.Dynamic;

public sealed class ChartAxisSettings : ChartAxisBase
{
    /// <summary>
    /// 数据集的标签字段
    /// </summary>
    public string? Labels { get; set; }

    public Color? LabelsColor { get; set; }

    public ChartAxisSettings Clone() => new()
    {
        Name = Name, Labels = Labels,
        LabelsColor = LabelsColor, Formatter = Formatter,
        MinStep = MinStep, ForceStepToMin = ForceStepToMin, TextSize = TextSize
    };

    public PixUI.LiveCharts.Axis Build(IDynamicContext dynamicContext, AppBoxCore.DataTable list)
    {
        var res = new PixUI.LiveCharts.Axis();
        // if (!string.IsNullOrEmpty(Formatter))
        // {
        //     res.Labeler = v => string.Format(null, Formatter, v);
        // }

        res.TextSize = TextSize;
        res.MinStep = MinStep;
        res.ForceStepToMin = ForceStepToMin;
        if (LabelsColor.HasValue) res.LabelsPaint = new SolidColorPaint { Color = LabelsColor.Value };

        if (!string.IsNullOrEmpty(Labels))
        {
            res.Labeler = v =>
            {
                var index = (int)v;
                if (index < 0 || index >= list.Count)
                    return string.Empty;

                return list[index][Labels].ToStringValue();
            };
        }

        return res;
    }
}