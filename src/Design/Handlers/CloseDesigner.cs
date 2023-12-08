using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 前端关闭设计器时通知后端关闭相应的文档
/// </summary>
internal sealed class CloseDesigner : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var nodeType = (DesignNodeType)args.GetInt()!.Value;
        var nodeId = args.GetString();

        if (nodeType == DesignNodeType.ModelNode)
        {
            ModelId modelId = nodeId!;
            if (modelId.Type == ModelType.Service || modelId.Type == ModelType.View)
            {
                var modelNode = hub.DesignTree.FindModelNode(modelId);
                if (modelNode != null) //可能已被删除了，即由删除节点引发的关闭设计器
                {
                    var docId = modelNode.RoslynDocumentId!;
                    if (hub.TypeSystem.Workspace.IsDocumentOpen(docId))
                        hub.TypeSystem.Workspace.CloseDocument(docId);
                }
            }
        }

        return new ValueTask<AnyValue>(AnyValue.Empty);
    }
}