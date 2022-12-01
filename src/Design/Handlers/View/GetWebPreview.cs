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
        var tsCode = await ViewJsGenerator.GenViewWebCode(hub, modelId);
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