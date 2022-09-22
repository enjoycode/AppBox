using System.Diagnostics;
using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI.CS2TS;

namespace AppBoxDesign;

/// <summary>
/// 获取WebIDE预览用的视图模型的JS代码
/// </summary>
internal sealed class GetWebPreview : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        //开始转换生成视图模型的js代码
        var srcPrjId = hub.TypeSystem.WebViewsProjectId;
        var translator = new Translator(hub.TypeSystem.Workspace, srcPrjId);
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
        var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;

        // 始终检查语义错误，防止同步过程出现问题
        var semanticModel = await srcDocument.GetSemanticModelAsync();
        var diagnostics = semanticModel!.GetDiagnostics();
        if (diagnostics.Any(t => t.Severity == DiagnosticSeverity.Error))
            throw new Exception("Has error");

        var emitter = await Emitter.MakeAsync(translator, srcDocument, true,
            fullName => hub.DesignTree.FindModelNodeByFullName(fullName) != null);
        emitter.Emit();
        var tsCode = emitter.GetTypeScriptCode(true);

        //附加import使用到的模型

        if (emitter.UsedModels.Count > 0)
        {
            var sb = StringBuilderCache.Acquire();
            sb.Append("\nconst EntityFactories=new Map([");

            foreach (var fullName in emitter.UsedModels)
            {
                //根据名称找到相关模型
                var usedModel = hub.DesignTree.FindModelNodeByFullName(fullName)!;
                var usedModelName = usedModel.Model.Name; //TODO:考虑加应用前缀防止同名
                // var usedModelAppName = usedModel.AppNode.Model.Name;
                var usedModelType = usedModel.Model.ModelType.ToString();
                var usedModelId = usedModel.Model.Id;

                sb.Insert(0,
                    $"import {{{usedModelName}}} from '/preview/{usedModelType}/{hub.Session.SessionId}/{usedModelId}'\n");

                //附加EntityFactories常量
                sb.Append($"[{usedModel.Model.Id.Value}n, ()=>new {usedModelName}()],");
            }

            sb.Append("]);\n\n"); //end EntityFactories

            sb.Append(tsCode);
            tsCode = StringBuilderCache.GetStringAndRelease(sb);
        }
        else
        {
            tsCode = tsCode + "\nconst EntityFactories=null;";
        }

        return AnyValue.From(Encoding.UTF8.GetBytes(tsCode));
    }

    // private static async Task<byte[]> ConvertToJs(string tsCode, ModelNode modelNode)
    // {
    //     //npx swc -C module.type=es6 -C jsc.target=es2022 HomePage.ts
    //     //npx swc -C module.type=es6 -C jsc.target=es2022 -C sourceMaps=false -C inlineSourcesContent=false -C minify=true HomePage.ts
    //     //TODO:*** 暂简单使用tsc转换处理
    //     var tsTemp = Path.Combine(Path.GetTempPath(),
    //         $"{modelNode.AppNode.Model.Name}.{modelNode.Model.Name}.ts");
    //     await File.WriteAllTextAsync(tsTemp, tsCode);
    //     var process = Process.Start("tsc", $"-t esnext -m esnext {tsTemp}");
    //     process!.WaitForExit();
    //
    //     var jsTemp = Path.Combine(Path.GetDirectoryName(tsTemp)!,
    //         $"{modelNode.AppNode.Model.Name}.{modelNode.Model.Name}.js");
    //     var data = await File.ReadAllBytesAsync(jsTemp);
    //
    //     File.Delete(tsTemp);
    //     File.Delete(jsTemp);
    //     return data;
    // }
}