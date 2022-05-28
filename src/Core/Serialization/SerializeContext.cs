namespace AppBoxCore;

/// <summary>
/// 序列化时的上下文,主要管理循环引用
/// </summary>
public sealed class SerializeContext
{
    private List<object>? _serialized;

    public void Clear() => _serialized?.Clear();

    public void AddToSerialized(object obj)
    {
        _serialized ??= new List<object>();
        _serialized.Add(obj);
    }

    public int GetSerializedIndex(object obj)
    {
        if (_serialized == null || _serialized.Count == 0)
            return -1;
        for (var i = _serialized.Count - 1; i >= 0; i--)
        {
            if (ReferenceEquals(_serialized[i], obj))
                return i;
        }

        return -1;
    }
}