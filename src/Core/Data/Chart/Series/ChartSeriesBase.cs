using AppBoxCore;

namespace AppBoxDesign;

public abstract class ChartSeriesBase : IBinSerializable
{
    public abstract ChartSeriesType SeriesType { get; }

    /// <summary>
    /// 度量(Measure)值表达式
    /// </summary>
    /// <remarks>
    /// 用于报表时 eg: =Fields.成绩字段
    /// </remarks>
    public string Values { get; set; } = string.Empty;

    /// <summary>
    /// 显示名称
    /// </summary>
    public string? Name { get; set; }

    public bool ShowDataLabels { get; set; }

    public bool IsVisibleAtLegend { get; set; } = true;

    /// <summary>
    /// 数据点标签格式化
    /// </summary>
    /// <remarks>
    /// 1.非表达式 eg: "C2"
    /// 2.表达式 eg: =Coordinate.PrimaryValue.ToString("C2")
    /// </remarks>
    public string? DataLabelsFormatter { get; set; }

    public virtual void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        //为了将来改写表达式，全部写入字段标识
        writer.WriteFieldId(1);
        writer.WriteString(Values);

        if (!string.IsNullOrEmpty(Name))
        {
            writer.WriteFieldId(3);
            writer.WriteString(Name);
        }

        if (ShowDataLabels)
        {
            writer.WriteFieldId(4);
            writer.WriteBool(ShowDataLabels);
        }

        if (!IsVisibleAtLegend)
        {
            writer.WriteFieldId(5);
            writer.WriteBool(IsVisibleAtLegend);
        }

        if (!string.IsNullOrEmpty(DataLabelsFormatter))
        {
            writer.WriteFieldId(6);
            writer.WriteString(DataLabelsFormatter);
        }

        writer.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader reader) where TReader : struct, IInputStream
    {
        while (true)
        {
            var fieldId = reader.ReadFieldId();
            switch (fieldId)
            {
                case 1: Values = reader.ReadString() ?? string.Empty; break;
                case 3: Name = reader.ReadString(); break;
                case 4: ShowDataLabels = reader.ReadBool(); break;
                case 5: IsVisibleAtLegend = reader.ReadBool(); break;
                case 6: DataLabelsFormatter = reader.ReadString(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(ChartSeriesBase), fieldId);
            }
        }
    }
}