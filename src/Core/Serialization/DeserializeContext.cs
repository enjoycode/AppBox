namespace AppBoxCore;

/// <summary>
/// 反序列化时的上下文,主要管理循环引用及实体创建
/// </summary>
public sealed class DeserializeContext
{
    private List<object>? _deserialized;

    public void Clear() => _deserialized?.Clear();

    public void AddToDeserialized(object obj)
    {
        _deserialized ??= new List<object>();
        _deserialized.Add(obj);
    }

    public object GetDeserialized(int index) => _deserialized![index];

    //public void RegisterEntityFactory(Func<Entity> factory);

    //public Func<Entity> GetEntityFactory(long modelId);
}