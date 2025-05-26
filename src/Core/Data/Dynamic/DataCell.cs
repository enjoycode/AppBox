using System.Globalization;
using System.Runtime.InteropServices;

namespace AppBoxCore;

[Flags]
public enum DataType : byte
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
public readonly struct DataCell
{
    public static readonly DataCell Empty = new() { Flag = DataType.Empty };

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

    [field: FieldOffset(24)] private DataType Flag { get; init; }

    #endregion

    public DataCell WithChanged() => new()
        { GuidValue = GuidValue, ObjectValue = ObjectValue, Flag = Flag | DataType.Changed };

    public DataCell WithoutChange() => new()
        { GuidValue = GuidValue, ObjectValue = ObjectValue, Flag = Flag & DataType.TypeMask };

    public bool HasValue
    {
        get
        {
            var type = Flag & DataType.TypeMask;
            if (type is DataType.String or DataType.Binary)
                return ObjectValue != null;
            return type != DataType.Empty;
        }
    }

    public bool HasChanged => (Flag & DataType.Changed) == DataType.Changed;

    public object? BoxedValue => (Flag & DataType.TypeMask) switch
    {
        DataType.String or DataType.Binary => ObjectValue,
        DataType.Empty => null,
        DataType.Bool => BoolValue,
        DataType.Byte => ByteValue,
        DataType.Short => ShortValue,
        DataType.Int => IntValue,
        DataType.Long => LongValue,
        DataType.Float => FloatValue,
        DataType.Double => DoubleValue,
        DataType.Decimal => DecimalValue,
        DataType.DateTime => DateTimeValue,
        DataType.Guid => GuidValue,
        _ => throw new NotSupportedException()
    };

    public string? StringValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.String)
                throw new NotSupportedException();
            return (string)ObjectValue!;
        }
    }

    public int? NullableIntValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.Int)
                throw new NotSupportedException();
            return IntValue;
        }
    }

    public DateTime? NullableDateTimeValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.DateTime)
                throw new NotSupportedException();
            return DateTimeValue;
        }
    }

    public float? NullableFloatValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.Float)
                throw new NotSupportedException();
            return FloatValue;
        }
    }
    
    public double? NullableDoubleValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.Double)
                throw new NotSupportedException();
            return DoubleValue;
        }
    }

    public Guid? NullableGuidValue
    {
        get
        {
            if (!HasValue) return null;
            var type = Flag & DataType.TypeMask;
            if (type != DataType.Guid)
                throw new NotSupportedException();
            return GuidValue;
        }
    }
    
    /// <summary>
    /// 主要用于Chart转换为相应的ChartPoint
    /// </summary>
    public double? ToDouble()
    {
        var type = Flag & DataType.TypeMask;
        return type switch
        {
            DataType.Bool => BoolValue ? 1 : 0,
            DataType.Byte => ByteValue,
            DataType.Short => ShortValue,
            DataType.Int => IntValue,
            DataType.Long => LongValue,
            DataType.Float => FloatValue,
            DataType.Double => DoubleValue,
            DataType.Decimal => (double)DecimalValue,
            _ => null
        };
    }

    public string ToStringValue()
    {
        if (!HasValue) return string.Empty;

        var type = Flag & DataType.TypeMask;
        return type switch
        {
            DataType.String => $"{(string)ObjectValue!}",
            DataType.Binary => StringUtil.ToHexString((byte[])ObjectValue!)!,
            DataType.Bool => BoolValue.ToString(),
            DataType.Byte => ByteValue.ToString(),
            DataType.Short => ShortValue.ToString(),
            DataType.Int => IntValue.ToString(),
            DataType.Long => LongValue.ToString(),
            DataType.Float => FloatValue.ToString(CultureInfo.InvariantCulture),
            DataType.Double => DoubleValue.ToString(CultureInfo.InvariantCulture),
            DataType.DateTime => DateTimeValue.ToString(CultureInfo.InvariantCulture),
            DataType.Decimal => DecimalValue.ToString(CultureInfo.InvariantCulture),
            DataType.Guid => $"{GuidValue.ToString()}",
            _ => string.Empty
        };
    }

    public override string ToString()
    {
        var type = Flag & DataType.TypeMask;
        return type switch
        {
            DataType.Empty => "null",
            DataType.String => $"\"{(string)ObjectValue!}\"",
            DataType.Binary => StringUtil.ToHexString((byte[])ObjectValue!)!,
            DataType.Bool => BoolValue.ToString(),
            DataType.Byte => ByteValue.ToString(),
            DataType.Short => ShortValue.ToString(),
            DataType.Int => IntValue.ToString(),
            DataType.Long => LongValue.ToString(),
            DataType.Float => FloatValue.ToString(CultureInfo.InvariantCulture),
            DataType.Double => DoubleValue.ToString(CultureInfo.InvariantCulture),
            DataType.DateTime => DateTimeValue.ToString(CultureInfo.InvariantCulture),
            DataType.Decimal => DecimalValue.ToString(CultureInfo.InvariantCulture),
            DataType.Guid => $"\"{GuidValue.ToString()}\"",
            _ => "Unknown"
        };
    }

    public static DataType DataTypeFromEntityFieldType(EntityFieldType entityFieldType) => entityFieldType switch
    {
        EntityFieldType.String => DataType.String,
        EntityFieldType.DateTime => DataType.DateTime,
        EntityFieldType.Short => DataType.Short,
        EntityFieldType.Int => DataType.Int,
        EntityFieldType.Long => DataType.Long,
        EntityFieldType.Decimal => DataType.Decimal,
        EntityFieldType.Bool => DataType.Bool,
        EntityFieldType.Guid => DataType.Guid,
        EntityFieldType.Byte => DataType.Byte,
        EntityFieldType.Binary => DataType.Binary,
        EntityFieldType.Enum => DataType.Int,
        EntityFieldType.Float => DataType.Float,
        EntityFieldType.Double => DataType.Double,
        _ => throw new NotImplementedException()
    };

    #region ====隐式转换=====

    public static implicit operator DataCell(bool? v) =>
        v.HasValue ? new() { BoolValue = v.Value, Flag = DataType.Bool } : Empty;

    public static implicit operator bool?(DataCell p) => p.HasValue ? p.BoolValue : null;

    public static implicit operator DataCell(byte? v) =>
        v.HasValue ? new() { ByteValue = v.Value, Flag = DataType.Byte } : Empty;

    public static implicit operator byte?(DataCell p) => p.HasValue ? p.ByteValue : null;

    public static implicit operator DataCell(short? v) =>
        v.HasValue ? new() { ShortValue = v.Value, Flag = DataType.Short } : Empty;

    public static implicit operator short?(DataCell p) => p.HasValue ? p.ShortValue : null;

    public static implicit operator DataCell(int? v) =>
        v.HasValue ? new() { IntValue = v.Value, Flag = DataType.Int } : Empty;

    public static implicit operator int?(DataCell p) => p.HasValue ? p.IntValue : null;

    public static implicit operator DataCell(long? v) =>
        v.HasValue ? new() { LongValue = v.Value, Flag = DataType.Long } : Empty;

    public static implicit operator long?(DataCell p) => p.HasValue ? p.LongValue : null;

    public static implicit operator DataCell(float? v) =>
        v.HasValue ? new() { FloatValue = v.Value, Flag = DataType.Float } : Empty;

    public static implicit operator float?(DataCell p) => p.HasValue ? p.FloatValue : null;

    public static implicit operator DataCell(double? v) =>
        v.HasValue ? new() { DoubleValue = v.Value, Flag = DataType.Double } : Empty;

    public static implicit operator double?(DataCell p) => p.HasValue ? p.DoubleValue : null;

    public static implicit operator DataCell(DateTime? v) =>
        v.HasValue ? new() { DateTimeValue = v.Value, Flag = DataType.DateTime } : Empty;

    public static implicit operator DateTime?(DataCell p) => p.HasValue ? p.DateTimeValue : null;

    public static implicit operator DataCell(decimal? v) =>
        v.HasValue ? new() { DecimalValue = v.Value, Flag = DataType.Decimal } : Empty;

    public static implicit operator decimal?(DataCell p) => p.HasValue ? p.DecimalValue : null;

    public static implicit operator DataCell(Guid? v) =>
        v.HasValue ? new() { GuidValue = v.Value, Flag = DataType.Guid } : Empty;

    public static implicit operator Guid?(DataCell p) => p.HasValue ? p.GuidValue : null;

    public static implicit operator DataCell(string? v) =>
        new() { ObjectValue = v, Flag = v == null ? DataType.Empty : DataType.String };

    public static implicit operator string?(DataCell p) => p.HasValue ? (string)p.ObjectValue! : null;

    public static implicit operator DataCell(byte[]? v) =>
        new() { ObjectValue = v, Flag = v == null ? DataType.Empty : DataType.Binary };

    public static implicit operator byte[]?(DataCell p) => p.HasValue ? (byte[])p.ObjectValue! : null;

    #endregion

    #region ====Serialization====

    internal void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)Flag);

        var type = Flag & DataType.TypeMask;
        switch (type)
        {
            case DataType.Empty:
                break;
            case DataType.String:
                ws.WriteString((string?)ObjectValue);
                break;
            case DataType.Binary:
                var len = ObjectValue == null ? -1 : ((byte[])ObjectValue).Length;
                ws.WriteVariant(len);
                if (len > 0) ws.WriteBytes((byte[])ObjectValue!);
                break;
            case DataType.Bool:
                ws.WriteBool(BoolValue);
                break;
            case DataType.Byte:
                ws.WriteByte(ByteValue);
                break;
            case DataType.Short:
                ws.WriteShort(ShortValue);
                break;
            case DataType.Int:
                ws.WriteInt(IntValue);
                break;
            case DataType.Long:
                ws.WriteLong(LongValue);
                break;
            case DataType.Float:
                ws.WriteFloat(FloatValue);
                break;
            case DataType.Double:
                ws.WriteDouble(DoubleValue);
                break;
            case DataType.DateTime:
                ws.WriteDateTime(DateTimeValue);
                break;
            case DataType.Decimal:
                ws.WriteDecimal(DecimalValue);
                break;
            case DataType.Guid:
                ws.WriteGuid(GuidValue);
                break;
            default: throw new NotSupportedException(type.ToString());
        }
    }

    internal static DataCell ReadFrom(IInputStream rs)
    {
        var flag = (DataType)rs.ReadByte();
        var type = flag & DataType.TypeMask;
        switch (type)
        {
            case DataType.Empty:
                return new DataCell() { Flag = flag };
            case DataType.String:
                return new DataCell() { Flag = flag, ObjectValue = rs.ReadString() };
            case DataType.Binary:
                var len = rs.ReadVariant();
                var bytes = new byte[len];
                rs.ReadBytes(bytes);
                return new DataCell() { Flag = flag, ObjectValue = bytes };
            case DataType.Bool:
                return new DataCell() { Flag = flag, BoolValue = rs.ReadBool() };
            case DataType.Byte:
                return new DataCell() { Flag = flag, ByteValue = rs.ReadByte() };
            case DataType.Short:
                return new DataCell() { Flag = flag, ShortValue = rs.ReadShort() };
            case DataType.Int:
                return new DataCell() { Flag = flag, IntValue = rs.ReadInt() };
            case DataType.Long:
                return new DataCell() { Flag = flag, LongValue = rs.ReadLong() };
            case DataType.Float:
                return new DataCell() { Flag = flag, FloatValue = rs.ReadFloat() };
            case DataType.Double:
                return new DataCell() { Flag = flag, DoubleValue = rs.ReadDouble() };
            case DataType.DateTime:
                return new DataCell() { Flag = flag, DateTimeValue = rs.ReadDateTime() };
            case DataType.Decimal:
                return new DataCell() { Flag = flag, DecimalValue = rs.ReadDecimal() };
            case DataType.Guid:
                return new DataCell() { Flag = flag, GuidValue = rs.ReadGuid() };
            default:
                throw new NotSupportedException(type.ToString());
        }
    }

    #endregion
}