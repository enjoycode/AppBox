using System;
using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 元数据序列化为byte[]及相应的反序列化
/// </summary>
public static class MetaSerializer
{
    public static byte[] SerializeMeta<T>(T obj) where T: IBinSerializable
    {
        using var ms = new MemoryWriteStream(128);
        obj.WriteTo(ms);
        return ms.Data;
    }

    public static T DeserializeMeta<T>(byte[] data, Func<T> creator) where T: IBinSerializable
    {
        var obj = creator();
        using var ms = new MemoryReadStream(data);
        obj.ReadFrom(ms);
        return obj;
    }
}