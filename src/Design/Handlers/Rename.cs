using AppBoxCore;

namespace AppBoxDesign;

internal sealed class Rename : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var referenceType = (ModelReferenceType)args.GetInt()!.Value;
        ModelId modelId = args.GetString()!;
        var oldName = args.GetString()!;
        var newName = args.GetString()!;

        if (string.IsNullOrEmpty(oldName) || string.IsNullOrEmpty(newName))
            throw new ArgumentNullException();
        if (oldName == newName)
            throw new ArgumentException();
        
        //TODO:目前存在一致性问题, 即无法重命名其他开发者刚签入的模型引用
        //可考虑冻结所有模型签出，并检查现有版本是否最新:
        //开发者1: 签出模型A                           -> 重命名A->此时找不到模型B的引用          
        //开发者2: 签出模型B -> 模型B引用了模型A -> 保存发布

        var references =
          await  ReferenceService.RenameAsync(hub, referenceType, modelId, oldName, newName);

        var res = references.Select(t => t.ModelNode.Model.Id.ToString()).Distinct().ToArray();
        return AnyValue.From(res);
    }
}