using System.Runtime.InteropServices;

namespace AppBoxCore;

/// <summary>
/// 任意值，可包含C#常规则内置类型或引用类型或Boxed的结构体
/// 主要用于服务调用的返回值，以减少常规类型的装拆箱操作
/// </summary>
[StructLayout(LayoutKind.Explicit, Pack = 4)]
public struct AnyValue : IEquatable<AnyValue>
{
    public static readonly AnyValue Empty = new AnyValue { Type = AnyValueType.Empty };

    #region ====内存结构===

    [FieldOffset(0)] private Guid _GuidValue;
    [FieldOffset(0)] private ushort _UInt16Value;
    [FieldOffset(0)] private short _Int16Value;
    [FieldOffset(0)] private int _Int32Value;
    [FieldOffset(0)] private uint _UInt32Value;
    [FieldOffset(0)] private long _Int64Value;
    [FieldOffset(0)] private ulong _UInt64Value;
    [FieldOffset(0)] private byte _ByteValue;
    [FieldOffset(0)] private bool _BooleanValue;
    [FieldOffset(0)] private DateTime _DateTimeValue;
    [FieldOffset(0)] private float _FloatValue;
    [FieldOffset(0)] private double _DoubleValue;
    [FieldOffset(0)] private decimal _DecimalValue;

    [FieldOffset(16)] private object? _ObjectValue;

    [FieldOffset(24)] private AnyValueType Type;

    #endregion

    public bool IsEmpty => Type == AnyValueType.Empty;

    public bool BoolValue => _BooleanValue;

    public byte ByteValue => _ByteValue;

    public short ShortValue => _Int16Value;

    public int IntValue => _Int32Value;

    public long LongValue => _Int64Value;

    public float FloatValue => _FloatValue;

    public double DoubleValue => _DoubleValue;

    public DateTime DateTimeValue => _DateTimeValue;

    public decimal DecimalValue => _DecimalValue;

    public Guid GuidValue => _GuidValue;

    public object? BoxedValue
    {
        get
        {
            return Type switch
            {
                AnyValueType.Boolean => _BooleanValue,
                AnyValueType.Byte => _ByteValue,
                AnyValueType.Int16 => _Int16Value,
                AnyValueType.UInt16 => _UInt16Value,
                AnyValueType.Int32 => _Int32Value,
                AnyValueType.UInt32 => _UInt32Value,
                AnyValueType.Int64 => _Int64Value,
                AnyValueType.UInt64 => _UInt64Value,
                AnyValueType.Float => _FloatValue,
                AnyValueType.Double => _DoubleValue,
                AnyValueType.DateTime => _DateTimeValue,
                AnyValueType.Decimal => _DecimalValue,
                AnyValueType.Guid => _GuidValue,
                _ => _ObjectValue,
            };
        }
    }

    #region ====FromXXX Methods, 仅用于生成虚拟服务代码的IService接口====

    public static AnyValue From(bool v) => new() { _BooleanValue = v, Type = AnyValueType.Boolean };

    public static AnyValue From(byte v) => new() { _ByteValue = v, Type = AnyValueType.Byte };

    public static AnyValue From(ushort v) => new() { _UInt16Value = v, Type = AnyValueType.UInt16 };

    public static AnyValue From(short v) => new() { _Int16Value = v, Type = AnyValueType.Int16 };

    public static AnyValue From(uint v) => new() { _UInt32Value = v, Type = AnyValueType.UInt32 };

    public static AnyValue From(int v) => new() { _Int32Value = v, Type = AnyValueType.Int32 };

    public static AnyValue From(ulong v) => new() { _UInt64Value = v, Type = AnyValueType.UInt64 };

    public static AnyValue From(long v) => new() { _Int64Value = v, Type = AnyValueType.Int64 };

    public static AnyValue From(float v) => new() { _FloatValue = v, Type = AnyValueType.Float };

    public static AnyValue From(double v) => new() { _DoubleValue = v, Type = AnyValueType.Double };

    public static AnyValue From(DateTime v) =>
        new() { _DateTimeValue = v, Type = AnyValueType.DateTime };

    public static AnyValue From(decimal v) =>
        new() { _DecimalValue = v, Type = AnyValueType.Decimal };

    public static AnyValue From(Guid v) => new() { _GuidValue = v, Type = AnyValueType.Guid };

    public static AnyValue From(string v) => new() { _ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(object v) => new() { _ObjectValue = v, Type = AnyValueType.Object };

    #endregion

    #region ====隐式/显式转换====

    //注意隐式转换不支持接口类型及object
    public static implicit operator AnyValue(bool v)
        => new() { _BooleanValue = v, Type = AnyValueType.Boolean };

    public static implicit operator AnyValue(uint v)
        => new() { _UInt32Value = v, Type = AnyValueType.UInt32 };

    public static implicit operator AnyValue(int v)
        => new() { _Int32Value = v, Type = AnyValueType.Int32 };

    public static implicit operator AnyValue(string v)
        => new() { _ObjectValue = v, Type = AnyValueType.Object };

    // public static implicit operator AnyValue(Entity obj)
    //  => new() { ObjectValue = obj, Type = AnyValueType.Object };

    public static explicit operator string(AnyValue v) => v.BoxedValue!.ToString();

    public static explicit operator byte[](AnyValue v) => (byte[])v.BoxedValue!;

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
                bs.WriteBool(_BooleanValue);
                break;
            case AnyValueType.Byte:
                bs.Serialize(_ByteValue);
                break;
            case AnyValueType.Int32:
                bs.Serialize(_Int32Value);
                break;
            case AnyValueType.Object:
                bs.Serialize(_ObjectValue);
                break;
            default:
                throw new NotImplementedException($"序列化AnyValue: {Type}");
        }
    }

    #endregion

    public bool Equals(AnyValue other)
    {
        if (Type != other.Type) return false;
        if (Type == AnyValueType.Object) return _ObjectValue == other._ObjectValue;
        return _GuidValue == other._GuidValue;
    }
}

public enum AnyValueType : byte
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
}