using AppBoxCore;
using PixUI;

namespace AppBoxClient.Dynamic;

/// <summary>
/// 表格列根据条件设置的单元格样式
/// </summary>
public sealed class ConditionalCellStyle : IBinSerializable
{
    public Comparer Comparer { get; set; }
    public double Comparand { get; set; }
    public Color? TextColor { get; set; }
    public Color? FillColor { get; set; }

    public ConditionalCellStyle Clone() => new()
        { Comparer = Comparer, Comparand = Comparand, TextColor = TextColor, FillColor = FillColor };

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        //写入成员标识方便将来重写
        ws.WriteFieldId(1);
        ws.WriteByte((byte)Comparer);

        ws.WriteFieldId(2);
        ws.WriteDouble(Comparand);

        if (TextColor.HasValue)
        {
            ws.WriteFieldId(3);
            ws.WriteUInt((uint)TextColor.Value);
        }

        if (FillColor.HasValue)
        {
            ws.WriteFieldId(4);
            ws.WriteUInt((uint)FillColor.Value);
        }

        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 1: Comparer = (Comparer)rs.ReadByte(); break;
                case 2: Comparand = rs.ReadDouble(); break;
                case 3: TextColor = new Color(rs.ReadUInt()); break;
                case 4: FillColor = new Color(rs.ReadUInt()); break;
                case 0: return;
                default: throw SerializationException.ReadUnknownField(nameof(ConditionalCellStyle), fieldId);
            }
        }
    }
}

public enum Comparer : byte
{
    //Don't change value
    Greater = 0,
    GreaterOrEqual,
    Less,
    LessOrEqual,
    Equal,
    NotEqual,
}