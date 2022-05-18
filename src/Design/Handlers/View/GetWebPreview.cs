using AppBoxCore;
using PixUI.CS2TS;

namespace AppBoxDesign;

/// <summary>
/// 获取WebIDE预览用的视图模型的JS代码
/// </summary>
internal sealed class GetWebPreview : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var modelId = (long)ulong.Parse(args.GetString()!);
        var modelNode = hub.DesignTree.FindModelNode(ModelType.View, modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        //TODO:检查代码错误

        //开始转换生成视图模型的js代码
        var srcPrjId = hub.TypeSystem.WebViewsProjectId;
        var translator = new Translator(hub.TypeSystem.Workspace, srcPrjId);
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
        var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;
        var emitter = await Emitter.MakeAsync(translator, srcDocument);
        emitter.Emit();
        var tsCode = emitter.GetTypeScriptCode();

        //TODO:转换为js

        return tsCode;
    }
}