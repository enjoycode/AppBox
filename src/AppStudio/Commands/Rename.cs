using AppBoxCore;

namespace AppBoxDesign;

internal static class Rename
{
    /// <summary>
    /// 重命名命令
    /// </summary>
    /// <param name="modelId">待重命名的模型标识</param>
    /// <param name="referenceType">待重命名的类型</param>
    /// <param name="oldName">旧名称</param>
    /// <param name="newName">新名称</param>
    /// <returns>返回受影响的模型标识列表</returns>
    internal static async ValueTask<ModelId[]> Execute(ModelId modelId,
        ModelReferenceType referenceType, string oldName, string newName)
    {
        if (string.IsNullOrEmpty(oldName) || string.IsNullOrEmpty(newName))
            throw new ArgumentNullException();
        if (oldName == newName)
            throw new ArgumentException();

        //TODO:目前存在一致性问题, 即无法重命名其他开发者刚签入的模型引用
        //可考虑冻结所有模型签出，并检查现有版本是否最新:
        //开发者1: 签出模型A                           -> 重命名A->此时找不到模型B的引用          
        //开发者2: 签出模型B -> 模型B引用了模型A -> 保存发布

        var references =
            await ReferenceService.RenameAsync(DesignHub.Current, referenceType, modelId, oldName, newName);

        var res = references.Select(t => t.ModelNode.Model.Id)
            .Distinct()
            .ToArray();
        return res;
    }
}