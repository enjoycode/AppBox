namespace AppBoxCore;

/// <summary>
/// 设计时上下文，每个开发者对应一个实例
/// </summary>
public interface IDesignContext
{
    ApplicationModel GetApplicationModel(int appId);

    EntityModel GetEntityModel(ModelId modelID);
}