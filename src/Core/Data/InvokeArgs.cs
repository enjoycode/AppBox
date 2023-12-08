using System.Collections;

namespace AppBoxCore;

/// <summary>
/// 封装调用服务的参数，直接从流中反序列化相应的参数
/// </summary>
public readonly struct InvokeArgs
{
    private readonly MessageReadStream? _stream;

    private InvokeArgs(MessageReadStream stream)
    {
        _stream = stream;
    }

    public void SetEntityFactories(EntityFactory[] factories)
        => _stream?.Context.SetEntityFactories(factories); //stream maybe null when is Empty

    public void Free()
    {
        if (_stream != null)
            MessageReadStream.Return(_stream);
    }

    public static readonly InvokeArgs Empty = new();

    public static InvokeArgs From(MessageReadStream stream) => new(stream);

    #region ====MakeXXX Methods====

    public static InvokeArgs Make<T>(T arg)
    {
        var writer = MessageWriteStream.Rent();
        writer.Serialize(arg);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        var reader = MessageReadStream.Rent(data);
        return new InvokeArgs(reader);
    }

    public static InvokeArgs Make<T1, T2>(T1 arg1, T2 arg2)
    {
        var writer = MessageWriteStream.Rent();
        writer.Serialize(arg1);
        writer.Serialize(arg2);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        var reader = MessageReadStream.Rent(data);
        return new InvokeArgs(reader);
    }

    public static InvokeArgs Make<T1, T2, T3>(T1 arg1, T2 arg2, T3 arg3)
    {
        var writer = MessageWriteStream.Rent();
        writer.Serialize(arg1);
        writer.Serialize(arg2);
        writer.Serialize(arg3);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        var reader = MessageReadStream.Rent(data);
        return new InvokeArgs(reader);
    }

    public static InvokeArgs Make<T1, T2, T3, T4>(T1 arg1, T2 arg2, T3 arg3, T4 arg4)
    {
        var writer = MessageWriteStream.Rent();
        writer.Serialize(arg1);
        writer.Serialize(arg2);
        writer.Serialize(arg3);
        writer.Serialize(arg4);
        var data = writer.FinishWrite();
        MessageWriteStream.Return(writer);

        var reader = MessageReadStream.Rent(data);
        return new InvokeArgs(reader);
    }

    #endregion

    #region ====GetXXX Methods(所有均返回可为空的类型)====

    public bool? GetBool()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
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
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int16 => _stream.ReadShort(),
            PayloadType.Int32 => (short)_stream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public int? GetInt()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int32 => _stream.ReadInt(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public long? GetLong()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Int64 => _stream.ReadLong(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public float? GetFloat()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Float => _stream.ReadFloat(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }
    
    public double? GetDouble()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => _stream.ReadDouble(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public decimal? GetDecimal()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Double => _stream.ReadDecimal(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public DateTime? GetDateTime()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.DateTime => _stream.ReadDateTime(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public Guid? GetGuid()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        return payloadType switch
        {
            PayloadType.Null => null,
            PayloadType.Guid => _stream.ReadGuid(),
            _ => throw new SerializationException(SerializationError.PayloadTypeNotMatch)
        };
    }

    public string? GetString()
    {
        var payloadType = (PayloadType)_stream!.ReadByte();
        if (payloadType == PayloadType.String) return _stream.ReadString();
        if (payloadType == PayloadType.Null) return null;
        throw new SerializationException(SerializationError.PayloadTypeNotMatch);
    }

    public object? GetObject() => _stream!.Deserialize();

    /// <summary>
    /// 用于转换如Web前端封送的object[]数组
    /// </summary>
    public T[]? GetArray<T>()
    {
        var res = _stream!.Deserialize();
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
        var res = _stream!.Deserialize();
        if (res == null) return null;

        var list = (IList)res;
        // TODO:考虑判断源类型是否目标类型
        // var srcElementType = res.GetType().GenericTypeArguments[0];
        // if (srcElementType != typeof(T))
        return list.Cast<T>().ToList();
    }

    #endregion
}