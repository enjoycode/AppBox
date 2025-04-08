using System.Globalization;
using System.Runtime.InteropServices;

namespace AppBoxCore;

[Flags]
public enum DynamicFieldFlag : byte
{
    //注意类型名称与EntityFieldType一致,值暂不需要一致
    Empty = 0,
    String = 1,
    Binary = 2,
    Bool = 3,

    //----数值区间开始----
    Byte = 4,
    Short = 5,
    Int = 6,
    Long = 7,
    Float = 8,
    Double = 9,
    Decimal = 10,
    //----数值区间结束----

    DateTime = 11,
    Guid = 12,
    TypeMask = 0xF,
    Changed = 0x80,
}

[StructLayout(LayoutKind.Explicit, Pack = 4)]
public readonly struct DynamicField
{
    public static readonly DynamicField Empty = new() { Flag = DynamicFieldFlag.Empty };

    #region ====内存结构===

    [field: FieldOffset(0)] public bool BoolValue { get; private init; }
    [field: FieldOffset(0)] public byte ByteValue { get; private init; }
    [field: FieldOffset(0)] public short ShortValue { get; private init; }
    [field: FieldOffset(0)] public int IntValue { get; private init; }
    [field: FieldOffset(0)] public long LongValue { get; private init; }
    [field: FieldOffset(0)] public float FloatValue { get; private init; }
    [field: FieldOffset(0)] public double DoubleValue { get; private init; }
    [field: FieldOffset(0)] public DateTime DateTimeValue { get; private init; }
    [field: FieldOffset(0)] public decimal DecimalValue { get; private init; }
    [field: FieldOffset(0)] public Guid GuidValue { get; private init; }

    [field: FieldOffset(16)] private object? ObjectValue { get; init; }

    [field: FieldOffset(24)] private DynamicFieldFlag Flag { get; init; }

    #endregion

    public DynamicField WithChanged() => new()
        { GuidValue = GuidValue, ObjectValue = ObjectValue, Flag = Flag | DynamicFieldFlag.Changed };

    public DynamicField WithoutChange() => new()
        { GuidValue = GuidValue, ObjectValue = ObjectValue, Flag = Flag & DynamicFieldFlag.TypeMask };

    public bool HasValue
    {
        get
        {
            var type = Flag & DynamicFieldFlag.TypeMask;
            if (type is DynamicFieldFlag.String or DynamicFieldFlag.Binary)
                return ObjectValue != null;
            return type != DynamicFieldFlag.Empty;
        }
    }

    public bool HasChanged => (Flag & DynamicFieldFlag.Changed) == DynamicFieldFlag.Changed;

    public object? BoxedValue => (Flag & DynamicFieldFlag.TypeMask) switch
    {
        DynamicFieldFlag.String or DynamicFieldFlag.Binary => ObjectValue,
        DynamicFieldFlag.Empty => null,
        DynamicFieldFlag.Bool => BoolValue,
        DynamicFieldFlag.Byte => ByteValue,
        DynamicFieldFlag.Short => ShortValue,
        DynamicFieldFlag.Int => IntValue,
        DynamicFieldFlag.Long => LongValue,
        DynamicFieldFlag.Float => FloatValue,
        DynamicFieldFlag.Double => DoubleValue,
        DynamicFieldFlag.Decimal => DecimalValue,
        DynamicFieldFlag.DateTime => DateTimeValue,
        DynamicFieldFlag.Guid => GuidValue,
        _ => throw new NotSupportedException()
    };

    public string? StringValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DynamicFieldFlag.TypeMask;
            if (type != DynamicFieldFlag.String)
                throw new NotSupportedException();
            return (string)ObjectValue!;
        }
    }

    public int? NullableIntValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DynamicFieldFlag.TypeMask;
            if (type != DynamicFieldFlag.Int)
                throw new NotSupportedException();
            return IntValue;
        }
    }

    public DateTime? NullableDateTimeValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DynamicFieldFlag.TypeMask;
            if (type != DynamicFieldFlag.DateTime)
                throw new NotSupportedException();
            return DateTimeValue;
        }
    }

    /// <summary>
    /// 主要用于Chart转换为相应的ChartPoint
    /// </summary>
    public double? ToDouble()
    {
        var type = Flag & DynamicFieldFlag.TypeMask;
        return type switch
        {
            DynamicFieldFlag.Bool => BoolValue ? 1 : 0,
            DynamicFieldFlag.Byte => ByteValue,
            DynamicFieldFlag.Short => ShortValue,
            DynamicFieldFlag.Int => IntValue,
            DynamicFieldFlag.Long => LongValue,
            DynamicFieldFlag.Float => FloatValue,
            DynamicFieldFlag.Double => DoubleValue,
            DynamicFieldFlag.Decimal => (double)DecimalValue,
            _ => null
        };
    }

    public string ToStringValue()
    {
        if (!HasValue) return string.Empty;

        var type = Flag & DynamicFieldFlag.TypeMask;
        return type switch
        {
            DynamicFieldFlag.String => $"{(string)ObjectValue!}",
            DynamicFieldFlag.Binary => StringUtil.ToHexString((byte[])ObjectValue!)!,
            DynamicFieldFlag.Bool => BoolValue.ToString(),
            DynamicFieldFlag.Byte => ByteValue.ToString(),
            DynamicFieldFlag.Short => ShortValue.ToString(),
            DynamicFieldFlag.Int => IntValue.ToString(),
            DynamicFieldFlag.Long => LongValue.ToString(),
            DynamicFieldFlag.Float => FloatValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Double => DoubleValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.DateTime => DateTimeValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Decimal => DecimalValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Guid => $"{GuidValue.ToString()}",
            _ => string.Empty
        };
    }

    public override string ToString()
    {
        var type = Flag & DynamicFieldFlag.TypeMask;
        return type switch
        {
            DynamicFieldFlag.Empty => "null",
            DynamicFieldFlag.String => $"\"{(string)ObjectValue!}\"",
            DynamicFieldFlag.Binary => StringUtil.ToHexString((byte[])ObjectValue!)!,
            DynamicFieldFlag.Bool => BoolValue.ToString(),
            DynamicFieldFlag.Byte => ByteValue.ToString(),
            DynamicFieldFlag.Short => ShortValue.ToString(),
            DynamicFieldFlag.Int => IntValue.ToString(),
            DynamicFieldFlag.Long => LongValue.ToString(),
            DynamicFieldFlag.Float => FloatValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Double => DoubleValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.DateTime => DateTimeValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Decimal => DecimalValue.ToString(CultureInfo.InvariantCulture),
            DynamicFieldFlag.Guid => $"\"{GuidValue.ToString()}\"",
            _ => "Unknown"
        };
    }

    public static DynamicFieldFlag FlagFromEntityFieldType(EntityFieldType entityFieldType) => entityFieldType switch
    {
        EntityFieldType.String => DynamicFieldFlag.String,
        EntityFieldType.DateTime => DynamicFieldFlag.DateTime,
        EntityFieldType.Short => DynamicFieldFlag.Short,
        EntityFieldType.Int => DynamicFieldFlag.Int,
        EntityFieldType.Long => DynamicFieldFlag.Long,
        EntityFieldType.Decimal => DynamicFieldFlag.Decimal,
        EntityFieldType.Bool => DynamicFieldFlag.Bool,
        EntityFieldType.Guid => DynamicFieldFlag.Guid,
        EntityFieldType.Byte => DynamicFieldFlag.Byte,
        EntityFieldType.Binary => DynamicFieldFlag.Binary,
        EntityFieldType.Enum => DynamicFieldFlag.Int,
        EntityFieldType.Float => DynamicFieldFlag.Float,
        EntityFieldType.Double => DynamicFieldFlag.Double,
        _ => throw new NotImplementedException()
    };

    #region ====隐式转换=====

    public static implicit operator DynamicField(bool? v) =>
        v.HasValue ? new() { BoolValue = v.Value, Flag = DynamicFieldFlag.Bool } : Empty;

    public static implicit operator bool?(DynamicField p) => p.HasValue ? p.BoolValue : null;

    public static implicit operator DynamicField(byte? v) =>
        v.HasValue ? new() { ByteValue = v.Value, Flag = DynamicFieldFlag.Byte } : Empty;

    public static implicit operator byte?(DynamicField p) => p.HasValue ? p.ByteValue : null;

    public static implicit operator DynamicField(short? v) =>
        v.HasValue ? new() { ShortValue = v.Value, Flag = DynamicFieldFlag.Short } : Empty;

    public static implicit operator short?(DynamicField p) => p.HasValue ? p.ShortValue : null;

    public static implicit operator DynamicField(int? v) =>
        v.HasValue ? new() { IntValue = v.Value, Flag = DynamicFieldFlag.Int } : Empty;

    public static implicit operator int?(DynamicField p) => p.HasValue ? p.IntValue : null;

    public static implicit operator DynamicField(long? v) =>
        v.HasValue ? new() { LongValue = v.Value, Flag = DynamicFieldFlag.Long } : Empty;

    public static implicit operator long?(DynamicField p) => p.HasValue ? p.LongValue : null;

    public static implicit operator DynamicField(float? v) =>
        v.HasValue ? new() { FloatValue = v.Value, Flag = DynamicFieldFlag.Float } : Empty;

    public static implicit operator float?(DynamicField p) => p.HasValue ? p.FloatValue : null;

    public static implicit operator DynamicField(double? v) =>
        v.HasValue ? new() { DoubleValue = v.Value, Flag = DynamicFieldFlag.Double } : Empty;

    public static implicit operator double?(DynamicField p) => p.HasValue ? p.DoubleValue : null;

    public static implicit operator DynamicField(DateTime? v) =>
        v.HasValue ? new() { DateTimeValue = v.Value, Flag = DynamicFieldFlag.DateTime } : Empty;

    public static implicit operator DateTime?(DynamicField p) => p.HasValue ? p.DateTimeValue : null;

    public static implicit operator DynamicField(decimal? v) =>
        v.HasValue ? new() { DecimalValue = v.Value, Flag = DynamicFieldFlag.Decimal } : Empty;

    public static implicit operator decimal?(DynamicField p) => p.HasValue ? p.DecimalValue : null;

    public static implicit operator DynamicField(Guid? v) =>
        v.HasValue ? new() { GuidValue = v.Value, Flag = DynamicFieldFlag.Guid } : Empty;

    public static implicit operator Guid?(DynamicField p) => p.HasValue ? p.GuidValue : null;

    public static implicit operator DynamicField(string? v) =>
        new() { ObjectValue = v, Flag = v == null ? DynamicFieldFlag.Empty : DynamicFieldFlag.String };

    public static implicit operator string?(DynamicField p) => p.HasValue ? (string)p.ObjectValue! : null;

    public static implicit operator DynamicField(byte[]? v) =>
        new() { ObjectValue = v, Flag = v == null ? DynamicFieldFlag.Empty : DynamicFieldFlag.Binary };

    public static implicit operator byte[]?(DynamicField p) => p.HasValue ? (byte[])p.ObjectValue! : null;

    #endregion

    #region ====Serialization====

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)Flag);

        var type = Flag & DynamicFieldFlag.TypeMask;
        switch (type)
        {
            case DynamicFieldFlag.Empty:
                break;
            case DynamicFieldFlag.String:
                ws.WriteString((string?)ObjectValue);
                break;
            case DynamicFieldFlag.Binary:
                var len = ObjectValue == null ? -1 : ((byte[])ObjectValue).Length;
                ws.WriteVariant(len);
                if (len > 0) ws.WriteBytes((byte[])ObjectValue!);
                break;
            case DynamicFieldFlag.Bool:
                ws.WriteBool(BoolValue);
                break;
            case DynamicFieldFlag.Byte:
                ws.WriteByte(ByteValue);
                break;
            case DynamicFieldFlag.Short:
                ws.WriteShort(ShortValue);
                break;
            case DynamicFieldFlag.Int:
                ws.WriteInt(IntValue);
                break;
            case DynamicFieldFlag.Long:
                ws.WriteLong(LongValue);
                break;
            case DynamicFieldFlag.Float:
                ws.WriteFloat(FloatValue);
                break;
            case DynamicFieldFlag.Double:
                ws.WriteDouble(DoubleValue);
                break;
            case DynamicFieldFlag.DateTime:
                ws.WriteDateTime(DateTimeValue);
                break;
            case DynamicFieldFlag.Decimal:
                ws.WriteDecimal(DecimalValue);
                break;
            case DynamicFieldFlag.Guid:
                ws.WriteGuid(GuidValue);
                break;
            default: throw new NotSupportedException(type.ToString());
        }
    }

    internal static DynamicField ReadFrom(IInputStream rs)
    {
        var flag = (DynamicFieldFlag)rs.ReadByte();
        var type = flag & DynamicFieldFlag.TypeMask;
        switch (type)
        {
            case DynamicFieldFlag.Empty:
                return Empty;
            case DynamicFieldFlag.String:
                return rs.ReadString();
            case DynamicFieldFlag.Binary:
                var len = rs.ReadVariant();
                var bytes = new byte[len];
                rs.ReadBytes(bytes);
                return bytes;
            case DynamicFieldFlag.Bool:
                return rs.ReadBool();
            case DynamicFieldFlag.Byte:
                return rs.ReadByte();
            case DynamicFieldFlag.Short:
                return rs.ReadShort();
            case DynamicFieldFlag.Int:
                return rs.ReadInt();
            case DynamicFieldFlag.Long:
                return rs.ReadLong();
            case DynamicFieldFlag.Float:
                return rs.ReadFloat();
            case DynamicFieldFlag.Double:
                return rs.ReadDouble();
            case DynamicFieldFlag.DateTime:
                return rs.ReadDateTime();
            case DynamicFieldFlag.Decimal:
                return rs.ReadDecimal();
            case DynamicFieldFlag.Guid:
                return rs.ReadGuid();
            default: throw new NotSupportedException(type.ToString());
        }
    }

    #endregion
}