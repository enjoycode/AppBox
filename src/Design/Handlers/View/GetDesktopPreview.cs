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
        var modelNode = hub.DesignTree.FindModelNode(ModelType.View, modelId);
        if (modelNode == null)
            throw new Exception($"Can't find view model: {modelId}");

        //开始转换编译视图模型的运行时代码
        var srcPrjId = hub.TypeSystem.WebViewsProjectId;
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
        var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;

        //始终检查语义错误，防止同步过程出现问题
        var semanticModel = await srcDocument.GetSemanticModelAsync();
        var diagnostics = semanticModel!.GetDiagnostics();
        if (diagnostics.Any(t => t.Severity == DiagnosticSeverity.Error))
            throw new Exception("Has error");

        var appName = modelNode.AppNode.Model.Name;
        var codegen = new ViewCodeGenerator(hub, appName, semanticModel, (ViewModel)modelNode.Model);
        var newRootNode = codegen.Visit(await semanticModel.SyntaxTree.GetRootAsync());
        var docName = $"{appName}.Views.{modelNode.Model.Name}";
        var newTree = SyntaxFactory.SyntaxTree(newRootNode,
            path: docName + ".cs", encoding: Encoding.UTF8);
        //生成视图模型依赖的其他模型的运行时代码
        var usagesTree = codegen.GetUsagesTree();

        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion =
            $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        var usingAndVersionTree = SyntaxFactory.ParseSyntaxTree(
            CodeUtil.ViewGlobalUsings() +
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]");
        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Debug);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(docName)
            .AddReferences(GetViewModelReferences())
            .AddSyntaxTrees(newTree, usingAndVersionTree)
            .WithOptions(options);
        if (usagesTree != null)
            compilation = compilation.AddSyntaxTrees(usagesTree);

        using var dllStream = new MemoryStream(1024);
        var emitResult = compilation.Emit(dllStream);
        CodeGeneratorUtil.CheckEmitResult(emitResult);

        var asmData = dllStream.ToArray();
        return AnyValue.From(asmData);
    }

    private static IEnumerable<MetadataReference> GetViewModelReferences()
    {
        var deps = new List<MetadataReference>
        {
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            MetadataReferences.SystemRuntimeLib,
            MetadataReferences.SystemLinqLib,
            MetadataReferences.PixUIDesktopLib,
            MetadataReferences.AppBoxCoreLib,
            MetadataReferences.AppBoxClientLib
        };
        return deps;
    }
}