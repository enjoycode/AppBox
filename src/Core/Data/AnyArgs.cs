using System.Collections;
using System.Runtime.CompilerServices;

namespace AppBoxCore;

/// <summary>
/// 包装参数列表，用于服务方法调用及服务端事件参数
/// </summary>
public interface IAnyArgs
{
    /// <summary>
    /// 获取包装的读取流，仅MessageReadStream和FileReadStream支持
    /// </summary>
    IInputStream? InputStream { get; }

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

public static class AnyArgs
{
    public static EmptyArgs Empty { get; } = new();

    public static LocalArgs1 Make(AnyValue arg) => new(arg);

    public static LocalArgs1 Make(object? arg) => new(AnyValue.From(arg));

    public static LocalArgs2 Make(AnyValue arg1, AnyValue arg2) => new(arg1, arg2);

    public static LocalArgs3 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3) => new(arg1, arg2, arg3);

    public static LocalArgs4 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4)
        => new(arg1, arg2, arg3, arg4);

    public static LocalArgs5 Make(AnyValue arg1, AnyValue arg2, AnyValue arg3, AnyValue arg4, AnyValue arg5)
        => new(arg1, arg2, arg3, arg4, arg5);

    public static StreamArgs From(IInputStream stream) => new(stream);
}

public readonly struct EmptyArgs : IAnyArgs
{
    public IInputStream? InputStream => throw new NotSupportedException();
    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }
    public void SerializeTo(IOutputStream stream) { }

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
    public string? GetString() => throw new NotSupportedException();
    public object? GetObject() => throw new NotSupportedException();
    public T[]? GetArray<T>() => throw new NotSupportedException();
    public IList<T>? GetList<T>() => throw new NotSupportedException();

    #endregion
}

/// <summary>
/// 封装调用服务的参数，直接从流中反序列化相应的参数
/// </summary>
public readonly struct StreamArgs : IAnyArgs
{
    internal StreamArgs(IInputStream inputStream)
    {
        InputStream = inputStream;
    }

    public IInputStream InputStream { get; }

    public void SetEntityFactories(EntityFactory[] factories) => InputStream.Context.SetEntityFactories(factories);

    public void Free() => InputStream.Free();
    public void SerializeTo(IOutputStream stream) => throw new NotSupportedException();

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
        var payloadType = (PayloadType)InputStream.ReadByte();
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
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int16 => InputStream.ReadShort(),
            PayloadType.Int32 => (short)InputStream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public int? GetInt()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int32 => InputStream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public long? GetLong()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int64 => InputStream.ReadLong(),
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
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Float => InputStream.ReadFloat(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public double? GetDouble()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => InputStream.ReadDouble(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public decimal? GetDecimal()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => InputStream.ReadDecimal(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public DateTime? GetDateTime()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.DateTime => InputStream.ReadDateTime(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public Guid? GetGuid()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Guid => InputStream.ReadGuid(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public string? GetString()
    {
        var payloadType = (PayloadType)InputStream.ReadByte();
        if (payloadType == PayloadType.String) return InputStream.ReadString();
        if (payloadType == PayloadType.Null) return null;
        throw new SerializationException(SerializationError.PayloadTypeNotMatch);
    }

    public object? GetObject() => InputStream.Deserialize();

    /// <summary>
    /// 用于转换如Web前端封送的object[]数组
    /// </summary>
    public T[]? GetArray<T>()
    {
        var res = InputStream.Deserialize();
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
        var res = InputStream.Deserialize();
        if (res == null) return null;

        var list = (IList)res;
        // TODO:考虑判断源类型是否目标类型
        // var srcElementType = res.GetType().GenericTypeArguments[0];
        // if (srcElementType != typeof(T))
        return list.Cast<T>().ToList();
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
    public IInputStream? InputStream => throw new NotSupportedException();

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }
    public void SerializeTo(IOutputStream stream) => _value.SerializeTo(stream);

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

public struct LocalArgs2 : IAnyArgs
{
    internal LocalArgs2(AnyValue arg1, AnyValue arg2)
    {
        _values[0] = arg1;
        _values[1] = arg2;
    }

    private int _index;
    private readonly AnyValue2 _values;
    public IInputStream? InputStream => throw new NotSupportedException();

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
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

    public IInputStream? InputStream => throw new NotSupportedException();

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
        _values[2].SerializeTo(stream);
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
    public IInputStream? InputStream => throw new NotSupportedException();

    public void SetEntityFactories(EntityFactory[] factories) { }
    public void Free() { }

    public void SerializeTo(IOutputStream stream)
    {
        _values[0].SerializeTo(stream);
        _values[1].SerializeTo(stream);
        _values[2].SerializeTo(stream);
        _values[3].SerializeTo(stream);
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

    public IInputStream? InputStream => throw new NotSupportedException();

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