using AppBoxCore;
using Microsoft.CodeAnalysis.Elfie.Serialization;

namespace AppBoxDesign;

/// <summary>
/// 打开服务或视图模型时返回源代码
/// </summary>
internal sealed class OpenCodeModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        if (modelId.Type != ModelType.Service && modelId.Type != ModelType.View)
            throw new NotSupportedException("Only Service or View now");
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        //特殊处理动态视图
        if (modelNode.Model is ViewModel viewModel && viewModel.ViewType == ViewModelType.PixUIDynamic)
        {
            var srcCode = await TypeSystem.LoadSourceCode(null, modelNode);
            return srcCode;
        }

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