using AppBoxCore;

namespace AppBoxDesign;

internal sealed class OpenServiceModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(ModelType.Service, modelId);
        if (modelNode == null)
            throw new Exception($"Can't find service model: {modelId}");
        
        //先判断是否已经打开，是则先关闭，主要用于签出后重新加载
        var docId = modelNode.RoslynDocumentId!;
        if (hub.TypeSystem.Workspace.IsDocumentOpen(docId))
            hub.TypeSystem.Workspace.CloseDocument(docId);
        
        hub.TypeSystem.Workspace.OpenDocument(docId, false);
        
        //从已加载的设计树对应的RoslynDocument中获取源码
        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(docId);
        var sourceText = await doc!.GetTextAsync().ConfigureAwait(false);
        return sourceText.ToString();
    }
}