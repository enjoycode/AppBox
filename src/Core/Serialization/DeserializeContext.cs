namespace AppBoxCore;

/// <summary>
/// 反序列化时的上下文,主要管理循环引用及实体创建
/// </summary>
public sealed class DeserializeContext
{
    private List<object>? _deserialized;
    private EntityFactory[]? _entityFactories;

    public void Clear()
    {
        _deserialized?.Clear();
        _entityFactories = null;
    }

    public void AddToDeserialized(object obj)
    {
        _deserialized ??= new List<object>();
        _deserialized.Add(obj);
    }

    public object GetDeserialized(int index) => _deserialized![index];

    public void SetEntityFactories(EntityFactory[] factories) => _entityFactories = factories;

    /// <summary>
    /// 根据实体模型标识号获取实体运行时类型
    /// </summary>
    public Type GetEntityType(long modelId)
    {
        if (_entityFactories == null)
            return typeof(EntityData);
        var index = Array.FindIndex(_entityFactories, t => t.ModelId == modelId);
        return index < 0
            ? typeof(EntityData) //不存在返回动态类型，不抛异常
            : _entityFactories[index].EntityType;
    }

    /// <summary>
    /// 根据实体模型标识号获取实体实例
    /// </summary>
    public IBinSerializable MakeEntity(long modelId)
    {
        var entityType = GetEntityType(modelId);
        return entityType != typeof(EntityData)
            ? (IBinSerializable)Activator.CreateInstance(entityType)!
            : new EntityData(modelId);
    }
}

public readonly struct EntityFactory
{
    public readonly long ModelId;
    public readonly Type EntityType;

    public EntityFactory(long modelId, Type entityType)
    {
        ModelId = modelId;
        EntityType = entityType;
    }
}