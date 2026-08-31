using AppBoxCore;

namespace AppBoxDesign;

public abstract class ChartAxisBase
{
    public string? Name { get; set; }

    // public Color? LabelsColor { get; set; }

    /// <summary>
    /// 标签自定义格式化模版(暂保留)
    /// </summary>
    public string? Formatter { get; set; }

    public double MinStep { get; set; } = 0;

    public bool ForceStepToMin { get; set; }

    public double TextSize { get; set; } = 16;

    public virtual void WriteTo<TWriter>(ref TWriter writer) where TWriter : struct, IOutputStream
    {
        if (!string.IsNullOrEmpty(Name))
        {
            writer.WriteFieldId(1);
            writer.WriteString(Name);
        }

        if (!string.IsNullOrEmpty(Formatter))
        {
            writer.WriteFieldId(2);
            writer.WriteString(Formatter);
        }

        if (MinStep != 0)
        {
            writer.WriteFieldId(3);
            writer.WriteDouble(MinStep);
        }

        if (ForceStepToMin)
        {
            writer.WriteFieldId(4);
            writer.WriteBool(ForceStepToMin);
        }

        // ReSharper disable once CompareOfFloatsByEqualityOperator
        if (TextSize != 16)
        {
            writer.WriteFieldId(5);
            writer.WriteDouble(TextSize);
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
                case 1: Name = reader.ReadString(); break;
                case 2: Formatter = reader.ReadString(); break;
                case 3: MinStep = reader.ReadDouble(); break;
                case 4: ForceStepToMin = reader.ReadBool(); break;
                case 5: TextSize = reader.ReadDouble(); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(ChartAxisBase), fieldId);
            }
        }
    }
}