namespace AppBoxCore;

/// <summary>
/// 设计时或运行时的模型容器
/// </summary>
public interface IModelContainer
{
    ApplicationModel GetApplicationModel(int appId); //TODO: remove this

    EntityModel GetEntityModel(ModelId modelId);
}