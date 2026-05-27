using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

namespace AppBoxCore;

/// <summary>
/// 任意值，可包含C#常规则内置类型或引用类型或Boxed的结构体
/// 主要用于类型擦除及减少常规类型的装拆箱操作
/// </summary>
[StructLayout(LayoutKind.Explicit, Pack = 4)]
public readonly struct AnyValue : IEquatable<AnyValue>
{
    public static readonly AnyValue Empty = new();

    #region ====Ctor====

    //@formatter:off
    public AnyValue() { Type = ValueType.Empty; }
    private AnyValue(bool v) { Type = ValueType.Boolean; BoolValue = v; }
    private AnyValue(byte v) { Type = ValueType.Byte; ByteValue = v; }
    private AnyValue(sbyte v) { Type = ValueType.SByte; SByteValue = v; }
    private AnyValue(char v) { Type = ValueType.Char; CharValue = v; }
    private AnyValue(short v) { Type = ValueType.Int16; ShortValue = v; }
    private AnyValue(ushort v) { Type = ValueType.UInt16; UShortValue = v; }
    private AnyValue(int v) { Type = ValueType.Int32; IntValue = v; }
    private AnyValue(uint v) { Type = ValueType.UInt32; UIntValue = v; }
    private AnyValue(long v) { Type = ValueType.Int64; LongValue = v; }
    private AnyValue(ulong v) { Type = ValueType.UInt64; ULongValue = v; }
    private AnyValue(float v) { Type = ValueType.Float; FloatValue = v; }
    private AnyValue(double v) { Type = ValueType.Double; DoubleValue = v; }
    private AnyValue(decimal v) { Type = ValueType.Decimal; DecimalValue = v; }
    private AnyValue(DateTime v) { Type = ValueType.DateTime; DateTimeValue = v; }
    private AnyValue(Guid v) { Type = ValueType.Guid; GuidValue = v; }
    private AnyValue(object? v) { Type = v == null ? ValueType.Empty : ValueType.Object; ObjectValue = v; }
    private AnyValue(object v, ValueType type) { Type = type; ObjectValue = v;}
    //@formatter:on

    #endregion

    #region ====内存结构===

    [FieldOffset(0)] private readonly bool BoolValue;
    [FieldOffset(0)] private readonly byte ByteValue;
    [FieldOffset(0)] private readonly sbyte SByteValue;
    [FieldOffset(0)] private readonly char CharValue;
    [FieldOffset(0)] private readonly short ShortValue;
    [FieldOffset(0)] private readonly ushort UShortValue;
    [FieldOffset(0)] private readonly int IntValue;
    [FieldOffset(0)] private readonly uint UIntValue;
    [FieldOffset(0)] private readonly long LongValue;
    [FieldOffset(0)] private readonly ulong ULongValue;
    [FieldOffset(0)] private readonly float FloatValue;
    [FieldOffset(0)] private readonly double DoubleValue;
    [FieldOffset(0)] private readonly decimal DecimalValue;
    [FieldOffset(0)] private readonly DateTime DateTimeValue;
    [FieldOffset(0)] private readonly Guid GuidValue;
    [FieldOffset(16)] private readonly object? ObjectValue;
    [FieldOffset(24)] public readonly ValueType Type;

    #endregion

    public bool IsEmpty => Type == ValueType.Empty;

    public object? BoxedValue => Type switch
    {
        ValueType.Boolean => BoolValue,
        ValueType.Byte => ByteValue,
        ValueType.SByte => SByteValue,
        ValueType.Int16 => ShortValue,
        ValueType.UInt16 => UShortValue,
        ValueType.Int32 => IntValue,
        ValueType.UInt32 => UIntValue,
        ValueType.Int64 => LongValue,
        ValueType.UInt64 => ULongValue,
        ValueType.Float => FloatValue,
        ValueType.Double => DoubleValue,
        ValueType.Decimal => DecimalValue,
        ValueType.DateTime => DateTimeValue,
        ValueType.Guid => GuidValue,
        _ => ObjectValue,
    };

    #region ====GetXXX Methods====

    public bool? GetBool() =>
        IsEmpty ? null : Type != ValueType.Boolean ? throw new InvalidOperationException() : BoolValue;

    public byte? GetByte() =>
        IsEmpty ? null : Type != ValueType.Byte ? throw new InvalidOperationException() : ByteValue;

    public sbyte? GetSByte() =>
        IsEmpty ? null : Type != ValueType.SByte ? throw new InvalidOperationException() : SByteValue;

    public char? GetChar() =>
        IsEmpty ? null : Type != ValueType.Char ? throw new InvalidOperationException() : CharValue;

    public short? GetShort() =>
        IsEmpty ? null : Type != ValueType.Int16 ? throw new InvalidOperationException() : ShortValue;

    public int? GetInt() =>
        IsEmpty ? null : Type != ValueType.Int32 ? throw new InvalidOperationException() : IntValue;

    public long? GetLong() =>
        IsEmpty ? null : Type != ValueType.Int64 ? throw new InvalidOperationException() : LongValue;

    public float? GetFloat() =>
        IsEmpty ? null : Type != ValueType.Float ? throw new InvalidOperationException() : FloatValue;

    public double? GetDouble() =>
        IsEmpty ? null : Type != ValueType.Double ? throw new InvalidOperationException() : DoubleValue;

    public decimal? GetDecimal() =>
        IsEmpty ? null : Type != ValueType.Decimal ? throw new InvalidOperationException() : DecimalValue;

    public DateTime? GetDateTime() =>
        IsEmpty ? null : Type != ValueType.DateTime ? throw new InvalidOperationException() : DateTimeValue;

    public Guid? GetGuid() =>
        IsEmpty ? null : Type != ValueType.Guid ? throw new InvalidOperationException() : GuidValue;

    public string? GetString() => IsEmpty ? null : BoxedValue?.ToString();

    public object? GetObject() =>
        IsEmpty ? null : Type != ValueType.Object ? throw new InvalidOperationException() : ObjectValue;

    public T? GetEnum<T>() where T : struct, Enum
    {
        if (IsEmpty) return null;
        if (Type != ValueType.Int32) throw new InvalidCastException("Value can't cast to enum");

        return Unsafe.SizeOf<T>() switch
        {
            sizeof(byte) => Unsafe.BitCast<byte, T>((byte)IntValue),
            sizeof(short) => Unsafe.BitCast<short, T>((short)IntValue),
            sizeof(int) => Unsafe.BitCast<int, T>(IntValue),
            // sizeof(ulong)  => Unsafe.BitCast<TEnum, ulong>(value),
            _ => throw new InvalidCastException($"The size of {typeof(T)} is not supported."),
        };
    }

    #endregion

    #region ====CastTo====

    public T? CastTo<T>() where T : notnull
    {
        if (IsEmpty) return default;
        return typeof(T) switch
        {
            { } t when t == typeof(bool) => Type == ValueType.Boolean
                ? Unsafe.As<bool, T>(ref Unsafe.AsRef(in BoolValue))
                : throw new InvalidCastException($"{Type} can't cast to bool"),
            { } t when t == typeof(byte) => Type == ValueType.Byte
                ? Unsafe.As<byte, T>(ref Unsafe.AsRef(in ByteValue))
                : throw new InvalidCastException($"{Type} can't cast to byte"),
            { } t when t == typeof(sbyte) => Type == ValueType.SByte
                ? Unsafe.As<sbyte, T>(ref Unsafe.AsRef(in SByteValue))
                : throw new InvalidCastException($"{Type} can't cast to sbyte"),
            { } t when t == typeof(char) => Type == ValueType.Char
                ? Unsafe.As<char, T>(ref Unsafe.AsRef(in CharValue))
                : throw new InvalidCastException($"{Type} can't cast to char"),
            { } t when t == typeof(short) => Type == ValueType.Int16
                ? Unsafe.As<short, T>(ref Unsafe.AsRef(in ShortValue))
                : throw new InvalidCastException($"{Type} can't cast to short"),
            { } t when t == typeof(ushort) => Type == ValueType.UInt16
                ? Unsafe.As<ushort, T>(ref Unsafe.AsRef(in UShortValue))
                : throw new InvalidCastException($"{Type} can't cast to ushort"),
            { } t when t == typeof(int) => Type == ValueType.Int32
                ? Unsafe.As<int, T>(ref Unsafe.AsRef(in IntValue))
                : throw new InvalidCastException($"{Type} can't cast to int"),
            { } t when t == typeof(uint) => Type == ValueType.UInt32
                ? Unsafe.As<uint, T>(ref Unsafe.AsRef(in UIntValue))
                : throw new InvalidCastException($"{Type} can't cast to uint"),
            { } t when t == typeof(long) => Type == ValueType.Int64
                ? Unsafe.As<long, T>(ref Unsafe.AsRef(in LongValue))
                : throw new InvalidCastException($"{Type} can't cast to long"),
            { } t when t == typeof(ulong) => Type == ValueType.UInt64
                ? Unsafe.As<ulong, T>(ref Unsafe.AsRef(in ULongValue))
                : throw new InvalidCastException($"{Type} can't cast to ulong"),
            { } t when t == typeof(float) => Type == ValueType.Float
                ? Unsafe.As<float, T>(ref Unsafe.AsRef(in FloatValue))
                : throw new InvalidCastException($"{Type} can't cast to float"),
            { } t when t == typeof(double) => Type == ValueType.Double
                ? Unsafe.As<double, T>(ref Unsafe.AsRef(in DoubleValue))
                : throw new InvalidCastException($"{Type} can't cast to double"),
            { } t when t == typeof(decimal) => Type == ValueType.Decimal
                ? Unsafe.As<decimal, T>(ref Unsafe.AsRef(in DecimalValue))
                : throw new InvalidCastException($"{Type} can't cast to decimal"),
            { } t when t == typeof(DateTime) => Type == ValueType.DateTime
                ? Unsafe.As<DateTime, T>(ref Unsafe.AsRef(in DateTimeValue))
                : throw new InvalidCastException($"{Type} can't cast to DateTime"),
            { } t when t == typeof(Guid) => Type == ValueType.Guid
                ? Unsafe.As<Guid, T>(ref Unsafe.AsRef(in GuidValue))
                : throw new InvalidCastException($"{Type} can't cast to Guid"),
            _ => (T)BoxedValue!
        };
    }

    #endregion

    #region ====FromXXX Methods, 仅用于生成虚拟服务代码的IService接口====

    public static AnyValue From(bool v) => new(v);
    public static AnyValue From(bool? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(byte v) => new(v);
    public static AnyValue From(byte? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(sbyte v) => new(v);
    public static AnyValue From(sbyte? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(char v) => new(v);
    public static AnyValue From(char? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(ushort v) => new(v);
    public static AnyValue From(ushort? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(short v) => new(v);
    public static AnyValue From(short? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(uint v) => new(v);
    public static AnyValue From(uint? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(int v) => new(v);
    public static AnyValue From(int? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(ulong v) => new(v);
    public static AnyValue From(ulong? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(long v) => new(v);
    public static AnyValue From(long? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(float v) => new(v);
    public static AnyValue From(float? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(double v) => new(v);
    public static AnyValue From(double? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(decimal v) => new(v);
    public static AnyValue From(decimal? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(DateTime v) => new(v);
    public static AnyValue From(DateTime? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(Guid v) => new(v);
    public static AnyValue From(Guid? v) => v.HasValue ? new(v.Value) : Empty;

    public static AnyValue From(object? v)
    {
        if (v == null) return Empty;
        return v switch
        {
            bool boolValue => new(boolValue),
            byte byteValue => new(byteValue),
            sbyte sbyteValue => new(sbyteValue),
            char charValue => new(charValue),
            short shortValue => new(shortValue),
            ushort ushortValue => new(ushortValue),
            int intValue => new(intValue),
            uint uintValue => new(uintValue),
            long longValue => new(longValue),
            ulong ulongValue => new(ulongValue),
            float floatValue => new(floatValue),
            double doubleValue => new(doubleValue),
            decimal decimalValue => new(decimalValue),
            Guid guidValue => new(guidValue),
            DateTime dateTimeValue => new(dateTimeValue),
            _ => new(v)
        };
    }

    public static AnyValue From<T>(T v) where T : struct, Enum
    {
        var intValue = Unsafe.SizeOf<T>() switch
        {
            sizeof(byte) => Unsafe.BitCast<T, byte>(v),
            sizeof(short) => Unsafe.BitCast<T, short>(v),
            sizeof(int) => Unsafe.BitCast<T, int>(v),
            // sizeof(ulong)  => Unsafe.BitCast<TEnum, ulong>(value),
            _ => throw new InvalidCastException($"The size of {typeof(T)} is not supported."),
        };
        return new AnyValue(intValue);
    }

    public static AnyValue From<T>(T? v) where T : struct, Enum => v.HasValue ? From(v.Value) : Empty;

    public static AnyValue From<T>(Action<T> streamWriter) where T : struct, IOutputStream =>
        new(streamWriter, ValueType.Stream);

    /// <summary>
    /// 从输入流中读取
    /// </summary>
    public static AnyValue ReadFrom<T>(ref T stream) where T : struct, IInputStream
    {
        var payloadType = (PayloadType)stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => Empty,
            PayloadType.BooleanTrue => true,
            PayloadType.BooleanFalse => false,
            PayloadType.Byte => stream.ReadByte(),
            PayloadType.Int16 => stream.ReadShort(),
            PayloadType.Int32 => stream.ReadInt(),
            PayloadType.Int64 => stream.ReadLong(),
            PayloadType.Float => stream.ReadFloat(),
            PayloadType.Double => stream.ReadDouble(),
            PayloadType.Decimal => stream.ReadDecimal(),
            PayloadType.DateTime => stream.ReadDateTime(),
            PayloadType.Guid => stream.ReadGuid(),
            PayloadType.String => stream.ReadString() ?? Empty,
            PayloadType.EntitySet => throw new NotImplementedException("AnyValue.ReadFrom EntitySet"),
            _ => From(stream.ReadObject(payloadType))
        };
    }

    #endregion

    #region ====隐式/显式转换====

    //注意隐式转换不支持接口类型及object
    public static implicit operator AnyValue(bool v) => new(v);
    public static implicit operator AnyValue(byte v) => new(v);
    public static implicit operator AnyValue(sbyte v) => new(v);
    public static implicit operator AnyValue(char v) => new(v);
    public static implicit operator AnyValue(short v) => new(v);
    public static implicit operator AnyValue(ushort v) => new(v);
    public static implicit operator AnyValue(int v) => new(v);
    public static implicit operator AnyValue(uint v) => new(v);
    public static implicit operator AnyValue(long v) => new(v);
    public static implicit operator AnyValue(ulong v) => new(v);
    public static implicit operator AnyValue(float v) => new(v);
    public static implicit operator AnyValue(double v) => new(v);
    public static implicit operator AnyValue(decimal v) => new(v);
    public static implicit operator AnyValue(DateTime v) => new(v);
    public static implicit operator AnyValue(Guid v) => new(v);
    public static implicit operator AnyValue(string v) => new(v);

    public static explicit operator string(AnyValue v) => v.GetString() ?? string.Empty;
    public static explicit operator byte[](AnyValue v) => (byte[])v.BoxedValue!;

    //public static implicit operator AnyValue(Entity obj)=> new() { ObjectValue = obj, Type = AnyValueType.Object };

    #endregion

    #region ====Serialization====

    internal readonly void SerializeTo<T>(ref T bs) where T : struct, IOutputStream
    {
        //TODO: others
        switch (Type)
        {
            case ValueType.Empty:
                bs.WriteByte((byte)PayloadType.Null);
                break;
            case ValueType.Boolean:
                bs.WriteBool(BoolValue);
                break;
            case ValueType.Byte:
                bs.Serialize(ByteValue);
                break;
            case ValueType.Char:
                bs.Serialize(CharValue);
                break;
            case ValueType.Int16:
                bs.Serialize(ShortValue);
                break;
            case ValueType.Int32:
                bs.Serialize(IntValue);
                break;
            case ValueType.Int64:
                bs.Serialize(LongValue);
                break;
            case ValueType.Float:
                bs.Serialize(FloatValue);
                break;
            case ValueType.Double:
                bs.Serialize(DoubleValue);
                break;
            case ValueType.Decimal:
                bs.Serialize(DecimalValue);
                break;
            case ValueType.DateTime:
                bs.Serialize(DateTimeValue);
                break;
            case ValueType.Guid:
                bs.Serialize(GuidValue);
                break;
            case ValueType.Object:
                bs.Serialize(ObjectValue);
                break;
            case ValueType.Stream:
                ((Action<T>)ObjectValue!)(bs);
                break;
            default:
                throw new NotImplementedException($"序列化AnyValue: {Type}");
        }
    }

    internal static AnyValue DeserializeFrom<T>(ref T rs) where T : struct, IInputStream
    {
        var payloadType = (PayloadType)rs.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => Empty,
            PayloadType.BooleanTrue => From(true),
            PayloadType.BooleanFalse => From(false),
            PayloadType.Byte => From(rs.ReadByte()),
            PayloadType.Char => From(rs.ReadChar()),
            PayloadType.Int16 => From(rs.ReadShort()),
            PayloadType.Int32 => From(rs.ReadInt()),
            PayloadType.Int64 => From(rs.ReadLong()),
            PayloadType.Float => From(rs.ReadFloat()),
            PayloadType.Double => From(rs.ReadDouble()),
            PayloadType.Decimal => From(rs.ReadDecimal()),
            PayloadType.DateTime => From(rs.ReadDateTime()),
            PayloadType.Guid => From(rs.ReadGuid()),
            _ => From(rs.ReadObject(payloadType))
        };
    }

    #endregion

    #region ====Overrides Equals====

    public bool Equals(AnyValue other)
    {
        if (Type != other.Type) return false;
        if (Type == ValueType.Object)
            return Equals(ObjectValue, other.ObjectValue);
        return GuidValue == other.GuidValue;
    }

    public override bool Equals(object? obj) => obj is AnyValue value && Equals(value);

    public override int GetHashCode()
    {
        if (IsEmpty) return 0;
        if (Type is ValueType.Object or ValueType.Stream)
            return ObjectValue?.GetHashCode() ?? 0;
        return GuidValue.GetHashCode() ^ Type.GetHashCode();
    }

    #endregion

    public Type GetRuntimeType()
    {
        switch (Type)
        {
            case ValueType.Boolean: return typeof(bool);
            case ValueType.Byte: return typeof(byte);
            case ValueType.SByte: return typeof(sbyte);
            case ValueType.Char: return typeof(char);
            case ValueType.Int16: return typeof(short);
            case ValueType.UInt16: return typeof(ushort);
            case ValueType.Int32: return typeof(int);
            case ValueType.UInt32: return typeof(uint);
            case ValueType.Int64: return typeof(long);
            case ValueType.UInt64: return typeof(ulong);
            case ValueType.Float: return typeof(float);
            case ValueType.Double: return typeof(double);
            case ValueType.Decimal: return typeof(decimal);
            case ValueType.Guid: return typeof(Guid);
            default: return typeof(object);
        }
    }

    #region ====ConvertToXXX====

    public int ConvertToInt32() => Type switch
    {
        ValueType.Byte => ByteValue,
        ValueType.Char => CharValue,
        ValueType.Int16 => ShortValue,
        ValueType.UInt16 => UShortValue,
        ValueType.Int32 => IntValue,
        ValueType.UInt32 => unchecked((int)UIntValue),
        ValueType.Int64 => unchecked((int)LongValue),
        ValueType.UInt64 => unchecked((int)ULongValue),
        ValueType.Float => (int)FloatValue,
        ValueType.Double => (int)DoubleValue,
        ValueType.Decimal => (int)DecimalValue,
        _ => throw new InvalidCastException($"{Type} can't convert to Int32")
    };

    public float ConvertToFloat() => Type switch
    {
        ValueType.Byte => ByteValue,
        ValueType.Char => CharValue,
        ValueType.Int16 => ShortValue,
        ValueType.UInt16 => ShortValue,
        ValueType.Int32 => IntValue,
        ValueType.UInt32 => UIntValue,
        ValueType.Int64 => LongValue,
        ValueType.UInt64 => ULongValue,
        ValueType.Float => FloatValue,
        ValueType.Double => (float)DoubleValue,
        ValueType.Decimal => (float)DecimalValue,
        _ => throw new InvalidCastException($"{Type} can't convert to Float")
    };

    public double ConvertToDouble() => Type switch
    {
        ValueType.Byte => ByteValue,
        ValueType.Char => CharValue,
        ValueType.Int16 => ShortValue,
        ValueType.UInt16 => UShortValue,
        ValueType.Int32 => IntValue,
        ValueType.UInt32 => UIntValue,
        ValueType.Int64 => LongValue,
        ValueType.UInt64 => ULongValue,
        ValueType.Float => FloatValue,
        ValueType.Double => DoubleValue,
        ValueType.Decimal => (double)DecimalValue,
        _ => throw new InvalidCastException($"{Type} can't convert to Double")
    };

    #endregion

    public enum ValueType : byte
    {
        Empty,
        Object,
        Boolean,
        Byte,
        Char,
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
        SByte,
    }
}