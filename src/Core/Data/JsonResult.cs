using System.Text.Json;

namespace AppBoxCore;

/// <summary>
/// 用于后端向前端直接封送json结果
/// </summary>
public sealed class JsonResult : IBinSerializable
{
    internal JsonResult() {}
    
    public JsonResult(object? value)
    {
        _value = value;
    }

    private object? _value; //序列化时为目标，反序列化时为byte[]

    public T? ParseTo<T>()
    {
        var bytes = _value as byte[];
        if (bytes == null)
            throw new Exception("Value is not a byte[] array");

        return JsonSerializer.Deserialize<T>(bytes);
    }

    public void WriteTo(IOutputStream ws)
    {
        //TODO:暂简单实现，待实现流式写入
        var bytes = JsonSerializer.SerializeToUtf8Bytes(_value);
        ws.WriteVariant(bytes.Length);
        ws.WriteBytes(bytes);
    }

    public void ReadFrom(IInputStream rs)
    {
        var len = rs.ReadVariant();
        var bytes = new byte[len];
        rs.ReadBytes(bytes);
        _value = bytes;
    }
}