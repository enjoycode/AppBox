using AppBoxCore;

namespace AppBoxStore;

/// <summary>
/// 元数据序列化为byte[]及相应的反序列化
/// </summary>
public static class MetaSerializer
{
    public static byte[] SerializeMeta(object obj)
    {
        using var ms = new MemoryWriteStream(128);
        ms.Serialize(obj);
        return ms.Data;
    }

    public static object DeserializeMeta(byte[] data)
    {
        using var ms = new MemoryReadStream(data);
        return ms.Deserialize()!;
    }
}