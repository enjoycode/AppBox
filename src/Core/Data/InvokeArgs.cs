using System.Collections;
using System.Runtime.CompilerServices;

namespace AppBoxCore;

public interface IInvokeArgs
{
    /// <summary>
    /// 设置实体工厂，用于反序列化参数为实体
    /// </summary>
    void SetEntityFactories(EntityFactory[] factories);

    /// <summary>
    /// 释放相关资源
    /// </summary>
    void Free();

    void SerializeTo(IOutputStream stream);

    #region ====GetXXX Methods====

    MessageReadStream? GetReadStream();
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
    T[]? GetArray<T>();
    IList<T>? GetList<T>();

    #endregion
}

public static class InvokeArgs
{
    public static EmptyInvokeArgs Empty { get; } = new();

    public static LocalInvokeArgs1 Make(AnyValue arg) => new(arg);

    public static LocalInvokeArgs1 Make(object? arg) => new(AnyValue.From(arg));

    public static LocalInvokeArgs2 Make(AnyValue arg1, AnyValue arg2) => new(arg1, arg2);

    public static LocalInvokeArgs3 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3) => new(arg1, arg2, arg3);

    public static LocalInvokeArgs4 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4)
        => new(arg1, arg2, arg3, arg4);

    public static LocalInvokeArgs5 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
        => new(arg1, arg2, arg3, arg4, arg5);

    public static StreamInvokeArgs From(MessageReadStream stream) => new(stream);
}

public readonly struct EmptyInvokeArgs : IInvokeArgs
{
    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }
    public void SerializeTo(IOutputStream stream) { }

    #region ====GetXXX Methods====

    public MessageReadStream? GetReadStream() => throw new NotSupportedException();
    public bool? GetBool() => throw new NotSupportedException();
    public short? GetShort() => throw new NotSupportedException();
    public int? GetInt() => throw new NotSupportedException();
    public long? GetLong() => throw new NotSupportedException();
    public float? GetFloat() => throw new NotSupportedException();
    public double? GetDouble() => throw new NotSupportedException();
    public decimal? GetDecimal() => throw new NotSupportedException();
    public DateTime? GetDateTime() => throw new NotSupportedException();
    public Guid? GetGuid() => throw new NotSupportedException();
    public string? GetString() => throw new NotSupportedException();
    public object? GetObject() => throw new NotSupportedException();
    public T[]? GetArray<T>() => throw new NotSupportedException();
    public IList<T>? GetList<T>() => throw new NotSupportedException();

    #endregion
}

/// <summary>
/// 封装调用服务的参数，直接从流中反序列化相应的参数
/// </summary>
public readonly struct StreamInvokeArgs : IInvokeArgs
{
    internal StreamInvokeArgs(MessageReadStream stream)
    {
        Stream = stream;
    }

    private MessageReadStream Stream { get; }

    public void SetEntityFactories(EntityFactory[] factories) => Stream.Context.SetEntityFactories(factories);

    public void Free() => MessageReadStream.Return(Stream);
    public void SerializeTo(IOutputStream stream) => throw new NotSupportedException();

    #region ====MakeXXX Methods====

    // public static InvokeArgs Make<T>(T arg)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new InvokeArgs(reader);
    // }
    //
    // public static InvokeArgs Make<T1, T2>(T1 arg1, T2 arg2)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg1);
    //     writer.Serialize(arg2);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new InvokeArgs(reader);
    // }
    //
    // public static InvokeArgs Make<T1, T2, T3>(T1 arg1, T2 arg2, T3 arg3)
    // {
    //     var writer = MessageWriteStream.Rent();
    //     writer.Serialize(arg1);
    //     writer.Serialize(arg2);
    //     writer.Serialize(arg3);
    //     var data = writer.FinishWrite();
    //     MessageWriteStream.Return(writer);
    //
    //     var reader = MessageReadStream.Rent(data);
    //     return new InvokeArgs(reader);
    // }
    //
    // public static InvokeArgs Make<T1, T2, T3, T4>(T1 arg1, T2 arg2, T3 arg3, T4 arg4)
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
    //     return new InvokeArgs(reader);
    // }

    #endregion

    #region ====GetXXX Methods(所有均返回可为空的类型)====

    public MessageReadStream? GetReadStream() => Stream;

    public bool? GetBool()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
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
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int16 => Stream.ReadShort(),
            PayloadType.Int32 => (short)Stream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public int? GetInt()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int32 => Stream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public long? GetLong()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int64 => Stream.ReadLong(),
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
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Float => Stream.ReadFloat(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public double? GetDouble()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => Stream.ReadDouble(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public decimal? GetDecimal()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => Stream.ReadDecimal(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public DateTime? GetDateTime()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.DateTime => Stream.ReadDateTime(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public Guid? GetGuid()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Guid => Stream.ReadGuid(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public string? GetString()
    {
        var payloadType = (PayloadType)Stream.ReadByte();
        if (payloadType == PayloadType.String) return Stream.ReadString();
        if (payloadType == PayloadType.Null) return null;
        throw new SerializationException(SerializationError.PayloadTypeNotMatch);
    }

    public object? GetObject() => Stream.Deserialize();

    /// <summary>
    /// 用于转换如Web前端封送的object[]数组
    /// </summary>
    public T[]? GetArray<T>()
    {
        var res = Stream.Deserialize();
        if (res == null) return null;

        // TODO:考虑判断源类型是否目标类型
        var array = (IEnumerable)res;
        return array.Cast<T>().ToArray();
    }

    /// <summary>
    /// 用于转换如Web前端封送的List&lt;object&gt;或List&lt;Entity&gt;
    /// </summary>
    public IList<T>? GetList<T>()
    {
        var res = Stream.Deserialize();
        if (res == null) return null;

        var list = (IList)res;
        // TODO:考虑判断源类型是否目标类型
        // var srcElementType = res.GetType().GenericTypeArguments[0];
        // if (srcElementType != typeof(T))
        return list.Cast<T>().ToList();
    }

    #endregion
}

public readonly struct LocalInvokeArgs1 : IInvokeArgs
{
    internal LocalInvokeArgs1(AnyValue value)
    {
        _value = value;
    }

    private readonly AnyValue _value;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }
    public void SerializeTo(IOutputStream stream) => _value.SerializeTo(stream);

    public MessageReadStream GetReadStream() => throw new NotSupportedException();
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
    public T[]? GetArray<T>() => (T[]?)_value.GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_value.GetObject();
}

public struct LocalInvokeArgs2 : IInvokeArgs
{
    internal LocalInvokeArgs2(AnyValue arg1, AnyValue arg2)
    {
        _values[0] = arg1;
        _values[1] = arg2;
    }

    private int _index;
    private readonly AnyValue2 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
    }

    public MessageReadStream GetReadStream() => throw new NotSupportedException();
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
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(2)]
    private struct AnyValue2
    {
        private AnyValue _value;
    }
}

public struct LocalInvokeArgs3 : IInvokeArgs
{
    internal LocalInvokeArgs3(AnyValue arg1, AnyValue arg2, AnyValue arg3)
    {
        _values[0] = arg1;
        _values[1] = arg2;
        _values[2] = arg3;
    }

    private int _index;
    private readonly AnyValue3 _values;

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
        _values[2].SerializeTo(stream);
    }

    public MessageReadStream GetReadStream() => throw new NotSupportedException();
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
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(3)]
    private struct AnyValue3
    {
        private AnyValue _value;
    }
}

public struct LocalInvokeArgs4 : IInvokeArgs
{
    internal LocalInvokeArgs4(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4)
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

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
        _values[2].SerializeTo(stream);
        _values[3].SerializeTo(stream);
    }

    public MessageReadStream GetReadStream() => throw new NotSupportedException();
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
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(4)]
    private struct AnyValue4
    {
        private AnyValue _value;
    }
}

public struct LocalInvokeArgs5 : IInvokeArgs
{
    internal LocalInvokeArgs5(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
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

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
        _values[2].SerializeTo(stream);
        _values[3].SerializeTo(stream);
        _values[4].SerializeTo(stream);
    }

    public MessageReadStream GetReadStream() => throw new NotSupportedException();
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
    public T[]? GetArray<T>() => (T[]?)_values[_index++].GetObject();
    public IList<T>? GetList<T>() => (IList<T>?)_values[_index++].GetObject();

    [InlineArray(5)]
    private struct AnyValue5
    {
        private AnyValue _value;
    }
}