using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 设计时生成用于Web的实体代码
/// </summary>
internal sealed class GetEntityPreview : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
#if DEBUG
        var forViteDev = args.GetBool()!.Value;
#endif
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find entity model: {modelId}");

        var jsCode = EntityJsGenerator.GenWebCode((EntityModel)modelNode.Model, hub, true
#if DEBUG
            , forViteDev
#endif
        );
        return new ValueTask<AnyValue>(
            AnyValue.From(System.Text.Encoding.UTF8.GetBytes(jsCode))
        );
    }
}