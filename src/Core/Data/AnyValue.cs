using System.Runtime.InteropServices;

namespace AppBoxCore;

/// <summary>
/// 任意值，可包含C#常规则内置类型或引用类型或Boxed的结构体
/// 主要用于服务调用的返回值，以减少常规类型的装箱操作
/// </summary>
[StructLayout(LayoutKind.Explicit, Pack = 4)]
public struct AnyValue
{
    public readonly static AnyValue Empty = new AnyValue { Type = AnyValueType.Empty };

    #region ====内存结构===

    [FieldOffset(0)] private Guid GuidValue;
    [FieldOffset(0)] private ushort UInt16Value;
    [FieldOffset(0)] private short Int16Value;
    [FieldOffset(0)] private int Int32Value;
    [FieldOffset(0)] private uint UInt32Value;
    [FieldOffset(0)] private long Int64Value;
    [FieldOffset(0)] private ulong UInt64Value;
    [FieldOffset(0)] private byte ByteValue;
    [FieldOffset(0)] private bool BooleanValue;
    [FieldOffset(0)] private DateTime DateTimeValue;
    [FieldOffset(0)] private float FloatValue;
    [FieldOffset(0)] private double DoubleValue;
    [FieldOffset(0)] private decimal DecimalValue;

    [FieldOffset(16)] private object? ObjectValue;

    [FieldOffset(24)] private AnyValueType Type;

    #endregion

    public object? BoxedValue
    {
        get
        {
            return Type switch
            {
                AnyValueType.Boolean => BooleanValue,
                AnyValueType.Byte => ByteValue,
                AnyValueType.Int16 => Int16Value,
                AnyValueType.UInt16 => UInt16Value,
                AnyValueType.Int32 => Int32Value,
                AnyValueType.UInt32 => UInt32Value,
                AnyValueType.Int64 => Int64Value,
                AnyValueType.UInt64 => UInt64Value,
                AnyValueType.Float => FloatValue,
                AnyValueType.Double => DoubleValue,
                AnyValueType.DateTime => DateTimeValue,
                AnyValueType.Decimal => DecimalValue,
                AnyValueType.Guid => GuidValue,
                _ => ObjectValue,
            };
        }
    }

    #region ====FromXXX Methods, 仅用于生成虚拟服务代码的IService接口====

    public static AnyValue From(bool v) =>
        new AnyValue { BooleanValue = v, Type = AnyValueType.Boolean };

    public static AnyValue From(byte v) => new AnyValue { ByteValue = v, Type = AnyValueType.Byte };

    public static AnyValue From(ushort v) =>
        new AnyValue { UInt16Value = v, Type = AnyValueType.UInt16 };

    public static AnyValue From(short v) =>
        new AnyValue { Int16Value = v, Type = AnyValueType.Int16 };

    public static AnyValue From(uint v) =>
        new AnyValue { UInt32Value = v, Type = AnyValueType.UInt32 };

    public static AnyValue From(int v) =>
        new AnyValue { Int32Value = v, Type = AnyValueType.Int32 };

    public static AnyValue From(ulong v) =>
        new AnyValue { UInt64Value = v, Type = AnyValueType.UInt64 };

    public static AnyValue From(long v) =>
        new AnyValue { Int64Value = v, Type = AnyValueType.Int64 };

    public static AnyValue From(float v) =>
        new AnyValue { FloatValue = v, Type = AnyValueType.Float };

    public static AnyValue From(double v) =>
        new AnyValue { DoubleValue = v, Type = AnyValueType.Double };

    public static AnyValue From(DateTime v) => new AnyValue
        { DateTimeValue = v, Type = AnyValueType.DateTime };

    public static AnyValue From(decimal v) => new AnyValue
        { DecimalValue = v, Type = AnyValueType.Decimal };

    public static AnyValue From(Guid v) => new AnyValue { GuidValue = v, Type = AnyValueType.Guid };

    public static AnyValue From(string v) =>
        new AnyValue { ObjectValue = v, Type = AnyValueType.Object };

    public static AnyValue From(object v) =>
        new AnyValue { ObjectValue = v, Type = AnyValueType.Object };

    #endregion

    #region ====隐式转换，仅用于方便服务端编码====

    //注意隐式转换不支持接口类型及object
    public static implicit operator AnyValue(uint v)
        => new AnyValue { UInt32Value = v, Type = AnyValueType.UInt32 };

    public static implicit operator AnyValue(int v)
        => new AnyValue { Int32Value = v, Type = AnyValueType.Int32 };

    public static implicit operator AnyValue(string v)
        => new AnyValue { ObjectValue = v, Type = AnyValueType.Object };

    // public static implicit operator AnyValue(Entity obj)
    //  => new AnyValue { ObjectValue = obj, Type = AnyValueType.Object };

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
                bs.WriteBool(BooleanValue);
                break;
            case AnyValueType.Byte:
                bs.Serialize(ByteValue);
                break;
            case AnyValueType.Int32:
                bs.Serialize(Int32Value);
                break;
            case AnyValueType.Object:
                bs.Serialize(ObjectValue);
                break;
            default:
                throw new NotImplementedException($"序列化AnyValue: {Type}");
        }
    }

    #endregion
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