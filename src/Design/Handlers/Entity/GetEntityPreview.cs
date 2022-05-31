using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 设计时生成用于Web的实体代码
/// </summary>
internal sealed class GetEntityPreview : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var modelId = (long)ulong.Parse(args.GetString()!);
        var modelNode = hub.DesignTree.FindModelNode(ModelType.Entity, modelId);
        if (modelNode == null)
            throw new Exception($"Can't find entity model: {modelId}");

        var jsCode = CodeGenService.GenEntityWebCode((EntityModel)modelNode.Model,
            modelNode.AppNode.Model.Name, true);
        return new ValueTask<AnyValue>(
            AnyValue.From(System.Text.Encoding.UTF8.GetBytes(jsCode))
        );
    }
}