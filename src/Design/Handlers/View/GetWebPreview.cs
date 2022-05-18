using System.Diagnostics;
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
        var tsCode = emitter.GetTypeScriptCode(true);

        //转换为js
        var jsCodeData = await ConvertToJs(tsCode, modelNode);
        return AnyValue.From(jsCodeData);
    }

    private static async Task<byte[]> ConvertToJs(string tsCode, ModelNode modelNode)
    {
        //TODO:*** 暂简单使用tsc转换处理
        var tsTemp = Path.Combine(Path.GetTempPath(), $"{modelNode.AppNode.Model.Name}.{modelNode.Model.Name}.ts");
        await File.WriteAllTextAsync(tsTemp, tsCode);
        var process = Process.Start("tsc", $"-t esnext -m esnext {tsTemp}");
        process!.WaitForExit();

        var jsTemp = Path.Combine(Path.GetDirectoryName(tsTemp)!,
            $"{modelNode.AppNode.Model.Name}.{modelNode.Model.Name}.js");
        var data = await File.ReadAllBytesAsync(jsTemp);
        
        File.Delete(tsTemp);
        File.Delete(jsTemp);
        return data;
    }
}