using AppBoxCore;

namespace AppBoxDesign;

internal sealed class OpenEntityModel : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(modelId.Type, modelId);
        if (modelNode == null)
            throw new Exception("Can't find entity model");

        var model = (EntityModel)modelNode.Model;
        //TODO:可能需要处理存储选项的引用关系，参考旧代码
        return new ValueTask<AnyValue>(AnyValue.From(EntityModelVO.From(model)));
    }
}