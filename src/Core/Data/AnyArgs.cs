using System.Collections;
using System.Runtime.CompilerServices;

namespace AppBoxCore;

/// <summary>
/// 包装参数列表，用于服务方法调用及服务端事件参数
/// </summary>
public interface IAnyArgs
{
    /// <summary>
    /// 设置实体工厂，用于反序列化参数为实体
    /// </summary>
    void SetEntityFactories(EntityFactory[] factories);

    /// <summary>
    /// 释放相关资源
    /// </summary>
    void Free();

    void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream;

    #region ====GetXXX Methods====

    bool? GetBool();
    short? GetShort();
    int? GetInt();
    long? GetLong();
    float? GetFloat();
    double? GetDouble();
    decimal? GetDecimal();
    DateTime? GetDateTime();
    Guid? GetGuid();
    string? GetString();
    object? GetObject();
    T? GetEnum<T>() where T : struct, Enum;
    T[]? GetArray<T>();
    IList<T>? GetList<T>();

    #endregion
}

public static class AnyArgs
{
    public const int MAX_COUNT = 5;

    public static EmptyArgs Empty { get; } = new();

    public static LocalArgs1 Make(AnyValue arg) => new(arg);

    public static LocalArgs1 Make(object? arg) => new(AnyValue.From(arg));

    public static LocalArgs2 Make(AnyValue arg1, AnyValue arg2) => new(arg1, arg2);

    public static LocalArgs3 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3) => new(arg1, arg2, arg3);

    public static LocalArgs4 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4)
        => new(arg1, arg2, arg3, arg4);

    public static LocalArgs5 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
        => new(arg1, arg2, arg3, arg4, arg5);

    /// <summary>
    /// 从消息流中构建参数
    /// </summary>
    /// <param name="stream">Owns it</param>
    public static StreamArgs<T> From<T>(T stream) where T : struct, IInputStream => new(stream);
}

public readonly struct EmptyArgs : IAnyArgs
{
    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }
    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream { }

    #region ====GetXXX Methods====

    public bool? GetBool() => throw new NotSupportedException();
    public short? GetShort() => throw new NotSupportedException();
    public int? GetInt() => throw new NotSupportedException();
    public long? GetLong() => throw new NotSupportedException();
    public float? GetFloat() => throw new NotSupportedException();
    public double? GetDouble() => throw new NotSupportedException();
    public decimal? GetDecimal() => throw new NotSupportedException();
    public DateTime? GetDateTime() => throw new NotSupportedException();
    public Guid? GetGuid() => throw new NotSupportedException();
    public string GetString() => throw new NotSupportedException();
    public object GetObject() => throw new NotSupportedException();
    public T? GetEnum<T>() where T : struct, Enum => throw new NotSupportedException();
    public T[] GetArray<T>() => throw new NotSupportedException();
    public IList<T> GetList<T>() => throw new NotSupportedException();

    #endregion
}

/// <summary>
/// 封装调用服务的参数，直接从流中反序列化相应的参数
/// </summary>
public struct StreamArgs<T> : IAnyArgs where T : struct, IInputStream
{
    internal StreamArgs(T inputStream)
    {
        _inputStream = inputStream;
    }

    private T _inputStream;

    public void SetEntityFactories(EntityFactory[] factories) => _inputStream.Context.SetEntityFactories(factories);

    public void Free() => _inputStream.Free();

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
        => throw new NotSupportedException();

    #region ====MakeXXX Methods====

    // public static StreamArgs Make<T>(T arg)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new StreamArgs(reader);
    // }
    //
    // public static StreamArgs Make<T1, T2>(T1 arg1, T2 arg2)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg1);
    //     writer.Serialize(arg2);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new StreamArgs(reader);
    // }
    //
    // public static StreamArgs Make<T1, T2, T3>(T1 arg1, T2 arg2, T3 arg3)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg1);
    //     writer.Serialize(arg2);
    //     writer.Serialize(arg3);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new StreamArgs(reader);
    // }
    //
    // public static StreamArgs Make<T1, T2, T3, T4>(T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg1);
    //     writer.Serialize(arg2);
    //     writer.Serialize(arg3);
    //     writer.Serialize(arg4);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new StreamArgs(reader);
    // }

    #endregion

    #region ====GetXXX Methods(所有均返回可为空的类型)====

    public bool? GetBool()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.BooleanTrue => true,
            PayloadType.BooleanFalse => false,
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public short? GetShort()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int16 => _inputStream.ReadShort(),
            PayloadType.Int32 => (short)_inputStream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public int? GetInt()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int32 => _inputStream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public long? GetLong()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int64 => _inputStream.ReadLong(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    // public ulong? GetULong()
    // {
    //     var payloadType = (PayloadType)_stream!.ReadByte();
    //     return payloadType switch
    //     {
    //         PayloadType.Null => null,
    //         PayloadType.UInt64 => _stream.ReadLong(),
    //         _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
    //     };
    // }

    public float? GetFloat()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Float => _inputStream.ReadFloat(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public double? GetDouble()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => _inputStream.ReadDouble(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public decimal? GetDecimal()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => _inputStream.ReadDecimal(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public DateTime? GetDateTime()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.DateTime => _inputStream.ReadDateTime(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public Guid? GetGuid()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Guid => _inputStream.ReadGuid(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public string? GetString()
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        if (payloadType == PayloadType.String) return _inputStream.ReadString();
        if (payloadType == PayloadType.Null) return null;
        throw new SerializationException(SerializationError.PayloadTypeNotMatch);
    }

    public object? GetObject() => _inputStream.Deserialize();

    public TValue? GetEnum<TValue>() where TValue : struct, Enum
    {
        var payloadType = (PayloadType)_inputStream.ReadByte();
        if (payloadType == PayloadType.Null) return null;
        if (payloadType != PayloadType.Int32)
            throw new SerializationException(SerializationError.PayloadTypeNotMatch);

        var intValue = _inputStream.ReadInt();
        return Unsafe.SizeOf<TValue>() switch
        {
            sizeof(byte) => Unsafe.BitCast<byte, TValue>((byte)intValue),
            sizeof(short) => Unsafe.BitCast<short, TValue>((short)intValue),
            sizeof(int) => Unsafe.BitCast<int, TValue>(intValue),
            // sizeof(ulong)  => Unsafe.BitCast<TValue, ulong>(value),
            _ => throw new InvalidCastException($"The size of {typeof(TValue)} is not supported."),
        };
    }

    /// <summary>
    /// 用于转换如Web前端封送的object[]数组
    /// </summary>
    public TValue[]? GetArray<TValue>()
    {
        var res = _inputStream.Deserialize();
        if (res == null) return null;

        // TODO:考虑判断源类型是否目标类型
        var array = (IEnumerable)res;
        return array.Cast<TValue>().ToArray();
    }

    /// <summary>
    /// 用于转换如Web前端封送的List&lt;object&gt;或List&lt;Entity&gt;
    /// </summary>
    public IList<TValue>? GetList<TValue>()
    {
        var res = _inputStream.Deserialize();
        if (res == null) return null;

        var list = (IList)res;
        // TODO:考虑判断源类型是否目标类型
        // var srcElementType = res.GetType().GenericTypeArguments[0];
        // if (srcElementType != typeof(T))
        return list.Cast<TValue>().ToList();
    }

    #endregion
}

public readonly struct LocalArgs1 : IAnyArgs
{
    internal LocalArgs1(AnyValue value)
    {
        _value = value;
    }

    private readonly AnyValue _value;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
        => _value.SerializeTo(ref stream);

    public bool? GetBool() => _value.GetBool();
    public short? GetShort() => _value.GetShort();
    public int? GetInt() => _value.GetInt();
    public long? GetLong() => _value.GetLong();
    public float? GetFloat() => _value.GetFloat();
    public double? GetDouble() => _value.GetDouble();
    public decimal? GetDecimal() => _value.GetDecimal();
    public DateTime? GetDateTime() => _value.GetDateTime();
    public Guid? GetGuid() => _value.GetGuid();
    public string? GetString() => (string?)_value.GetObject();
    public object? GetObject() => _value.GetObject();
    public T? GetEnum<T>() where T : struct, Enum => _value.GetEnum<T>();
    public T[]? GetArray<T>() => (T[]?)_value.GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_value.GetObject();
}

public struct LocalArgs2 : IAnyArgs
{
    internal LocalArgs2(AnyValue arg1, AnyValue arg2)
    {
        _values[0] = arg1;
        _values[1] = arg2;
    }

    private int _index;
    private readonly AnyValue2 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
    {
        _values[0].SerializeTo(ref stream);
        _values[1].SerializeTo(ref stream);
    }

    public bool? GetBool() => _values[_index++].GetBool();
    public short? GetShort() => _values[_index++].GetShort();
    public int? GetInt() => _values[_index++].GetInt();
    public long? GetLong() => _values[_index++].GetLong();
    public float? GetFloat() => _values[_index++].GetFloat();
    public double? GetDouble() => _values[_index++].GetDouble();
    public decimal? GetDecimal() => _values[_index++].GetDecimal();
    public DateTime? GetDateTime() => _values[_index++].GetDateTime();
    public Guid? GetGuid() => _values[_index++].GetGuid();
    public string? GetString() => (string?)_values[_index++].GetObject();
    public object? GetObject() => _values[_index++].GetObject();
    public T? GetEnum<T>() where T : struct, Enum => _values[_index++].GetEnum<T>();
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(2)]
    private struct AnyValue2
    {
        private AnyValue _value;
    }
}

public struct LocalArgs3 : IAnyArgs
{
    internal LocalArgs3(AnyValue arg1, AnyValue arg2, AnyValue arg3)
    {
        _values[0] = arg1;
        _values[1] = arg2;
        _values[2] = arg3;
    }

    private int _index;
    private readonly AnyValue3 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
    {
        _values[0].SerializeTo(ref stream);
        _values[1].SerializeTo(ref stream);
        _values[2].SerializeTo(ref stream);
    }

    public bool? GetBool() => _values[_index++].GetBool();
    public short? GetShort() => _values[_index++].GetShort();
    public int? GetInt() => _values[_index++].GetInt();
    public long? GetLong() => _values[_index++].GetLong();
    public float? GetFloat() => _values[_index++].GetFloat();
    public double? GetDouble() => _values[_index++].GetDouble();
    public decimal? GetDecimal() => _values[_index++].GetDecimal();
    public DateTime? GetDateTime() => _values[_index++].GetDateTime();
    public Guid? GetGuid() => _values[_index++].GetGuid();
    public string? GetString() => (string?)_values[_index++].GetObject();
    public object? GetObject() => _values[_index++].GetObject();
    public T? GetEnum<T>() where T : struct, Enum => _values[_index++].GetEnum<T>();
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(3)]
    private struct AnyValue3
    {
        private AnyValue _value;
    }
}

public struct LocalArgs4 : IAnyArgs
{
    internal LocalArgs4(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4)
    {
        _values[0] = arg1;
        _values[1] = arg2;
        _values[2] = arg3;
        _values[3] = arg4;
    }

    private int _index;
    private readonly AnyValue4 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
    {
        _values[0].SerializeTo(ref stream);
        _values[1].SerializeTo(ref stream);
        _values[2].SerializeTo(ref stream);
        _values[3].SerializeTo(ref stream);
    }

    public bool? GetBool() => _values[_index++].GetBool();
    public short? GetShort() => _values[_index++].GetShort();
    public int? GetInt() => _values[_index++].GetInt();
    public long? GetLong() => _values[_index++].GetLong();
    public float? GetFloat() => _values[_index++].GetFloat();
    public double? GetDouble() => _values[_index++].GetDouble();
    public decimal? GetDecimal() => _values[_index++].GetDecimal();
    public DateTime? GetDateTime() => _values[_index++].GetDateTime();
    public Guid? GetGuid() => _values[_index++].GetGuid();
    public string? GetString() => (string?)_values[_index++].GetObject();
    public object? GetObject() => _values[_index++].GetObject();
    public T? GetEnum<T>() where T : struct, Enum => _values[_index++].GetEnum<T>();
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(4)]
    private struct AnyValue4
    {
        private AnyValue _value;
    }
}

public struct LocalArgs5 : IAnyArgs
{
    internal LocalArgs5(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
    {
        _values[0] = arg1;
        _values[1] = arg2;
        _values[2] = arg3;
        _values[3] = arg4;
        _values[4] = arg5;
    }

    private int _index;
    private readonly AnyValue5 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo<TWriter>(ref TWriter stream) where TWriter : struct, IOutputStream
    {
        _values[0].SerializeTo(ref stream);
        _values[1].SerializeTo(ref stream);
        _values[2].SerializeTo(ref stream);
        _values[3].SerializeTo(ref stream);
        _values[4].SerializeTo(ref stream);
    }

    public bool? GetBool() => _values[_index++].GetBool();
    public short? GetShort() => _values[_index++].GetShort();
    public int? GetInt() => _values[_index++].GetInt();
    public long? GetLong() => _values[_index++].GetLong();
    public float? GetFloat() => _values[_index++].GetFloat();
    public double? GetDouble() => _values[_index++].GetDouble();
    public decimal? GetDecimal() => _values[_index++].GetDecimal();
    public DateTime? GetDateTime() => _values[_index++].GetDateTime();
    public Guid? GetGuid() => _values[_index++].GetGuid();
    public string? GetString() => (string?)_values[_index++].GetObject();
    public object? GetObject() => _values[_index++].GetObject();
    public T? GetEnum<T>() where T : struct, Enum => _values[_index++].GetEnum<T>();
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(5)]
    private struct AnyValue5
    {
        private AnyValue _value;
    }
}