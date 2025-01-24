using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于发布的模型包，支持依赖排序
/// </summary>
public sealed class PublishPackage
{
    public readonly List<ModelBase> Models = new();

    /// <summary>
    /// 需要保存或删除的模型根文件夹
    /// </summary>
    public readonly List<ModelFolder> Folders = new();

    /// <summary>
    /// 新建或更新的模型的虚拟代码，Key=ModelId
    /// </summary>
    public readonly Dictionary<ModelId, byte[]> SourceCodes = new();

    /// <summary>
    /// 新建或更新的编译好的服务组件, Key=xxx.XXXX
    /// </summary>
    public readonly Dictionary<string, byte[]> ServiceAssemblies = new();

    // /// <summary>
    // /// 新建或更新的视图组件, Key=xxx.XXXX
    // /// </summary>
    // public readonly Dictionary<string, byte[]> ViewAssemblies = new();

    /// <summary>
    /// 根据引用依赖关系排序
    /// </summary>
    public void SortAllModels()
    {
        Models.Sort((a, b) =>
        {
            //先将标为删除的排在前面
            if (a.PersistentState == PersistentState.Deleted
                && b.PersistentState != PersistentState.Deleted)
                return -1;
            if (a.PersistentState != PersistentState.Deleted
                && b.PersistentState == PersistentState.Deleted)
                return 1;
            //后面根据类型及依赖关系排序
            if (a.ModelType != b.ModelType)
                return a.ModelType.CompareTo(b.ModelType);
            if (a.ModelType == ModelType.Entity)
            {
                //注意如果都标为删除需要倒序
                if (a.PersistentState == PersistentState.Deleted)
                    return ((EntityModel)b).CompareTo((EntityModel)a);
                return ((EntityModel)a).CompareTo((EntityModel)b);
            }

            return string.Compare(a.Name, b.Name, StringComparison.Ordinal);
        });
    }
}