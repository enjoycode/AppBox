using System.Runtime.InteropServices;

namespace AppBoxCore;

/// <summary>
/// 任意值，可包含C#常规则内置类型或引用类型或Boxed的结构体
/// 主要用于服务调用的返回值，以减少常规类型的装拆箱操作
/// </summary>
[StructLayout(LayoutKind.Explicit, Pack = 4)]
public struct AnyValue : IEquatable<AnyValue> //TODO: rename to InvokeResult
{
    public static readonly AnyValue Empty = new AnyValue { Type = AnyValueType.Empty };

    #region ====内存结构===

    [field: FieldOffset(0)] public bool BoolValue { get; private set; }
    [field: FieldOffset(0)] public byte ByteValue { get; private set; }
    [field: FieldOffset(0)] public short ShortValue { get; private set; }
    [field: FieldOffset(0)] public ushort UShortValue { get; private set; }
    [field: FieldOffset(0)] public int IntValue { get; private set; }
    [field: FieldOffset(0)] public uint UIntValue { get; private set; }
    [field: FieldOffset(0)] public long LongValue { get; private set; }
    [field: FieldOffset(0)] public ulong ULongValue { get; private set; }
    [field: FieldOffset(0)] public float FloatValue { get; private set; }
    [field: FieldOffset(0)] public double DoubleValue { get; private set; }
    [field: FieldOffset(0)] public DateTime DateTimeValue { get; private set; }
    [field: FieldOffset(0)] public decimal DecimalValue { get; private set; }
    [field: FieldOffset(0)] public Guid GuidValue { get; private set; }

    [FieldOffset(16)] private object? _ObjectValue;

    [FieldOffset(24)] private AnyValueType Type;

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
                _ => _ObjectValue,
            };
        }
    }

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

    public static AnyValue From(string v) => new() { _ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(object v) => new() { _ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(Action<IOutputStream> streamWriter) => 
        new() { _ObjectValue = streamWriter, Type = AnyValueType.Stream };

    #endregion

    #region ====隐式/显式转换====

    //注意隐式转换不支持接口类型及object
    public static implicit operator AnyValue(bool v) => new() { BoolValue = v, Type = AnyValueType.Boolean };
    public static implicit operator AnyValue(uint v) => new() { UIntValue = v, Type = AnyValueType.UInt32 };
    public static implicit operator AnyValue(int v) => new() { IntValue = v, Type = AnyValueType.Int32 };
    public static implicit operator AnyValue(string v) => new() { _ObjectValue = v, Type = AnyValueType.Object };
    public static explicit operator string(AnyValue v) => v.BoxedValue!.ToString();
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
            case AnyValueType.Int32:
                bs.Serialize(IntValue);
                break;
            case AnyValueType.Object:
                bs.Serialize(_ObjectValue);
                break;
            case AnyValueType.Stream:
                ((Action<IOutputStream>)_ObjectValue!)(bs);
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
        return GuidValue == other.GuidValue;
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
    Stream,
}