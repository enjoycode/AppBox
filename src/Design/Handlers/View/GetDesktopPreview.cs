using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 获取桌面端IDE预览用的视图模型的运行时组件
/// </summary>
internal sealed class GetDesktopPreview : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        var codegen = await ViewCsGenerator.Make(hub, modelNode);
        var newTree = await codegen.GetRuntimeSyntaxTree();
        //生成视图模型依赖的其他模型的运行时代码
        var usagesTree = await BuildAllUsages(codegen);

        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        var usingAndVersionTree = SyntaxFactory.ParseSyntaxTree(
            CodeUtil.ViewGlobalUsings() +
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]");
        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Debug);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(null)
            .AddReferences(GetViewModelReferences())
            .AddSyntaxTrees(newTree, usingAndVersionTree)
            .WithOptions(options);
        // if (usagesTree.Any())
        compilation = compilation.AddSyntaxTrees(usagesTree);

        using var dllStream = new MemoryStream(1024);
        var emitResult = compilation.Emit(dllStream);
        CodeGeneratorUtil.CheckEmitResult(emitResult);

        var asmData = dllStream.ToArray(); //TODO:考虑写临时文件并返回流
        return AnyValue.From(asmData);
    }

    private static async Task<IEnumerable<SyntaxTree>> BuildAllUsages(ViewCsGenerator generator)
    {
        var ctx = new Dictionary<string, SyntaxTree>(); //key = Model's full name
        await generator.BuildUsages(ctx);
        return ctx.Values;
    }

    private static IEnumerable<MetadataReference> GetViewModelReferences()
    {
        var deps = new List<MetadataReference>
        {
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            MetadataReferences.SystemRuntimeLib,
            MetadataReferences.SystemObjectModelLib,
            MetadataReferences.SystemDataLib,
            MetadataReferences.SystemCollectionsLib,
            MetadataReferences.SystemLinqLib,
            MetadataReferences.PixUILib,
            MetadataReferences.LiveChartsCoreLib,
            MetadataReferences.PixUILiveChartsLib,
            MetadataReferences.AppBoxCoreLib,
            MetadataReferences.AppBoxClientLib,
            MetadataReferences.AppBoxClientUILib
        };
        return deps;
    }
}