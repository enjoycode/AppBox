using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 获取桌面端IDE预览用的视图模型的运行时组件
/// </summary>
internal static class BuildViewPreview
{
    internal static async Task<object> Execute(ModelId modelId)
    {
        var hub = DesignHub.Current;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        var codegen = await ViewCsGenerator.Make(hub, modelNode, true);
        var newTree = await codegen.GetRuntimeSyntaxTree();
        //生成视图模型依赖的其他模型的运行时代码
        var usagesTree = await BuildAllUsages(codegen);

        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        var usingAndVersionTree = SyntaxFactory.ParseSyntaxTree(
            CodeUtil.ViewGlobalUsings() + //[assembly:TargetFramework(".NETStandard, Version = v2.1")]
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly: AssemblyVersion(\"{asmVersion}\")]",
            TypeSystem.ParseOptions);
        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Debug);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(null)
            .AddReferences(MetadataReferences.GetViewsAssemblyReferences())
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
}