using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 保存模型（包括代码）至Staged
/// </summary>
internal sealed class SaveModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;

        var node = hub.DesignTree.FindModelNode(modelId.Type, modelId);
        if (node == null)
            throw new Exception("Can't find ModelNode");
        await node.SaveAsync(null);
        return AnyValue.Empty;
    }
}