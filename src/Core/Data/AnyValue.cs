using System.Runtime.InteropServices;

namespace AppBoxCore;

/// <summary>
/// 任意值，可包含C#常规则内置类型或引用类型或Boxed的结构体
/// 主要用于类型擦除及减少常规类型的装拆箱操作
/// </summary>
[StructLayout(LayoutKind.Explicit, Pack = 4)]
public readonly struct AnyValue : IEquatable<AnyValue>
{
    public static readonly AnyValue Empty = new() { Type = AnyValueType.Empty };

    #region ====内存结构===

    [field: FieldOffset(0)] private bool BoolValue { get; init; }
    [field: FieldOffset(0)] private byte ByteValue { get; init; }
    [field: FieldOffset(0)] private short ShortValue { get; init; }
    [field: FieldOffset(0)] private ushort UShortValue { get; init; }
    [field: FieldOffset(0)] private int IntValue { get; init; }
    [field: FieldOffset(0)] private uint UIntValue { get; init; }
    [field: FieldOffset(0)] private long LongValue { get; init; }
    [field: FieldOffset(0)] private ulong ULongValue { get; init; }
    [field: FieldOffset(0)] private float FloatValue { get; init; }
    [field: FieldOffset(0)] private double DoubleValue { get; init; }
    [field: FieldOffset(0)] private DateTime DateTimeValue { get; init; }
    [field: FieldOffset(0)] private decimal DecimalValue { get; init; }
    [field: FieldOffset(0)] private Guid GuidValue { get; init; }

    [field: FieldOffset(16)] private object? ObjectValue { get; init; }

    [field: FieldOffset(24)] private AnyValueType Type { get; init; }

    #endregion

    public bool IsEmpty => Type == AnyValueType.Empty;

    public object? BoxedValue
    {
        get
        {
            return Type switch
            {
                AnyValueType.Boolean => BoolValue,
                AnyValueType.Byte => ByteValue,
                AnyValueType.Int16 => ShortValue,
                AnyValueType.UInt16 => UShortValue,
                AnyValueType.Int32 => IntValue,
                AnyValueType.UInt32 => UIntValue,
                AnyValueType.Int64 => LongValue,
                AnyValueType.UInt64 => ULongValue,
                AnyValueType.Float => FloatValue,
                AnyValueType.Double => DoubleValue,
                AnyValueType.DateTime => DateTimeValue,
                AnyValueType.Decimal => DecimalValue,
                AnyValueType.Guid => GuidValue,
                _ => ObjectValue,
            };
        }
    }

    #region ====GetXXX Methods====

    public bool? GetBool() =>
        IsEmpty ? null : Type != AnyValueType.Boolean ? throw new InvalidOperationException() : BoolValue;

    public short? GetShort() =>
        IsEmpty ? null : Type != AnyValueType.Int16 ? throw new InvalidOperationException() : ShortValue;

    public int? GetInt() =>
        IsEmpty ? null : Type != AnyValueType.Int32 ? throw new InvalidOperationException() : IntValue;

    public long? GetLong() =>
        IsEmpty ? null : Type != AnyValueType.Int64 ? throw new InvalidOperationException() : LongValue;

    public float? GetFloat() =>
        IsEmpty ? null : Type != AnyValueType.Float ? throw new InvalidOperationException() : FloatValue;

    public double? GetDouble() =>
        IsEmpty ? null : Type != AnyValueType.Double ? throw new InvalidOperationException() : DoubleValue;

    public decimal? GetDecimal() =>
        IsEmpty ? null : Type != AnyValueType.Decimal ? throw new InvalidOperationException() : DecimalValue;

    public DateTime? GetDateTime() =>
        IsEmpty ? null : Type != AnyValueType.DateTime ? throw new InvalidOperationException() : DateTimeValue;

    public Guid? GetGuid() =>
        IsEmpty ? null : Type != AnyValueType.Guid ? throw new InvalidOperationException() : GuidValue;
    
    public object? GetObject() =>
        IsEmpty ? null : Type != AnyValueType.Object ? throw new InvalidOperationException() : ObjectValue;

    #endregion

    #region ====FromXXX Methods, 仅用于生成虚拟服务代码的IService接口====

    public static AnyValue From(bool v) => new() { BoolValue = v, Type = AnyValueType.Boolean };

    public static AnyValue From(byte v) => new() { ByteValue = v, Type = AnyValueType.Byte };

    public static AnyValue From(ushort v) => new() { UShortValue = v, Type = AnyValueType.UInt16 };

    public static AnyValue From(short v) => new() { ShortValue = v, Type = AnyValueType.Int16 };

    public static AnyValue From(uint v) => new() { UIntValue = v, Type = AnyValueType.UInt32 };

    public static AnyValue From(int v) => new() { IntValue = v, Type = AnyValueType.Int32 };

    public static AnyValue From(ulong v) => new() { ULongValue = v, Type = AnyValueType.UInt64 };

    public static AnyValue From(long v) => new() { LongValue = v, Type = AnyValueType.Int64 };

    public static AnyValue From(float v) => new() { FloatValue = v, Type = AnyValueType.Float };

    public static AnyValue From(double v) => new() { DoubleValue = v, Type = AnyValueType.Double };

    public static AnyValue From(DateTime v) => new() { DateTimeValue = v, Type = AnyValueType.DateTime };

    public static AnyValue From(decimal v) => new() { DecimalValue = v, Type = AnyValueType.Decimal };

    public static AnyValue From(Guid v) => new() { GuidValue = v, Type = AnyValueType.Guid };

    public static AnyValue From(string v) => new() { ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(object? v) =>
        v == null ? Empty : new() { ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(Action<IOutputStream> streamWriter) =>
        new() { ObjectValue = streamWriter, Type = AnyValueType.Stream };

    #endregion

    #region ====隐式/显式转换====

    //注意隐式转换不支持接口类型及object
    public static implicit operator AnyValue(bool v) => new() { BoolValue = v, Type = AnyValueType.Boolean };
    public static implicit operator AnyValue(uint v) => new() { UIntValue = v, Type = AnyValueType.UInt32 };
    public static implicit operator AnyValue(int v) => new() { IntValue = v, Type = AnyValueType.Int32 };
    public static implicit operator AnyValue(long v) => new() { LongValue = v, Type = AnyValueType.Int64 };
    public static implicit operator AnyValue(float v) => new() { FloatValue = v, Type = AnyValueType.Float };
    public static implicit operator AnyValue(double v) => new() { DoubleValue = v, Type = AnyValueType.Double };
    public static implicit operator AnyValue(string v) => new() { ObjectValue = v, Type = AnyValueType.Object };
    public static explicit operator string(AnyValue v) => v.BoxedValue?.ToString() ?? string.Empty;
    public static explicit operator byte[](AnyValue v) => (byte[])v.BoxedValue!;

    //public static implicit operator AnyValue(Entity obj)=> new() { ObjectValue = obj, Type = AnyValueType.Object };

    #endregion

    #region ====Serialization====

    internal readonly void SerializeTo(IOutputStream bs)
    {
        //TODO: others
        switch (Type)
        {
            case AnyValueType.Empty:
                break;
            case AnyValueType.Boolean:
                bs.WriteBool(BoolValue);
                break;
            case AnyValueType.Byte:
                bs.Serialize(ByteValue);
                break;
            case AnyValueType.Int16:
                bs.Serialize(ShortValue);
                break;
            case AnyValueType.Int32:
                bs.Serialize(IntValue);
                break;
            case AnyValueType.Int64:
                bs.Serialize(LongValue);
                break;
            case AnyValueType.Float:
                bs.Serialize(FloatValue);
                break;
            case AnyValueType.Double:
                bs.Serialize(DoubleValue);
                break;
            case AnyValueType.Decimal:
                bs.Serialize(DecimalValue);
                break;
            case AnyValueType.DateTime:
                bs.Serialize(DateTimeValue);
                break;
            case AnyValueType.Guid:
                bs.Serialize(GuidValue);
                break;
            case AnyValueType.Object:
                bs.Serialize(ObjectValue);
                break;
            case AnyValueType.Stream:
                ((Action<IOutputStream>)ObjectValue!)(bs);
                break;
            default:
                throw new NotImplementedException($"序列化AnyValue: {Type}");
        }
    }

    #endregion

    #region ====Overrides Equals====

    public bool Equals(AnyValue other)
    {
        if (Type != other.Type) return false;
        if (Type == AnyValueType.Object)
            return Equals(ObjectValue, other.ObjectValue);
        return GuidValue == other.GuidValue;
    }

    public override bool Equals(object? obj) => obj is AnyValue value && Equals(value);

    public override int GetHashCode()
    {
        if (IsEmpty) return 0;
        if (Type is AnyValueType.Object or AnyValueType.Stream)
            return ObjectValue?.GetHashCode() ?? 0;
        return GuidValue.GetHashCode() ^ Type.GetHashCode();
    }

    #endregion

    private enum AnyValueType : byte
    {
        Empty,
        Object,
        Boolean,
        Byte,
        Int16,
        UInt16,
        Int32,
        UInt32,
        Int64,
        UInt64,
        Float,
        Double,
        DateTime,
        Decimal,
        Guid,
        Stream,
    }
}