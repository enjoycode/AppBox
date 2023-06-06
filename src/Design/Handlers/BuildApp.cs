using System.IO.Compression;
using AppBoxCore;
using AppBoxStore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 生成客户端应用的程序集
/// </summary>
internal sealed class BuildApp : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        //TODO:*****目前简单实现，待实现从HomePage开始分析引用关系，仅生成用到的模型的程序集
        //TODO:检查签出情况，如有其他签出返回警告

        var force = args.GetBool(); //是否强制生成,目前保留
        var appAssemblies = new Dictionary<string, byte[]>();

        for (var i = 0; i < hub.DesignTree.AppRootNode.Children.Count; i++)
        {
            var appNode = hub.DesignTree.AppRootNode.Children[i];
            //生成实体模型程序集
            var entityRootNode = appNode.FindModelRootNode(ModelType.Entity);
            var entityModels = entityRootNode.GetAllModelNodes();
            var entitiesMetadataReference = await BuildEntitiesAssembly(hub, appNode.Model.Name, entityModels, appAssemblies);

            //生成视图模型程序集
            var viewRootNode = appNode.FindModelRootNode(ModelType.View);
            var viewModels = viewRootNode.GetAllModelNodes();
            await BuildViewsAssembly(hub, appNode.Model.Name, viewModels, appAssemblies, entitiesMetadataReference);
        }

        //保存入元数据
        await using var txn = await SqlStore.Default.BeginTransactionAsync();
        foreach (var kv in appAssemblies)
        {
            Log.Debug($"Assembly: {kv.Key} 压缩后: {kv.Value.Length}");
            await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.Application, kv.Key, kv.Value, txn);
        }

        await txn.CommitAsync();
        
        return AnyValue.From(true);
    }

    private static async Task<MetadataReference?> BuildEntitiesAssembly(DesignHub hub, string appName,
        IList<ModelNode> models,
        Dictionary<string, byte[]> appAssemblies)
    {
        if (models.Count == 0) return null;

        var srcPrjId = hub.TypeSystem.ModelProjectId;
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);

        var syntaxTrees = new List<SyntaxTree>();

        foreach (var modelNode in models)
        {
            var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;
            var semanticModel = await srcDocument.GetSemanticModelAsync();
            syntaxTrees.Add(semanticModel!.SyntaxTree);
        }

        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        syntaxTrees.Add(SyntaxFactory.ParseSyntaxTree(
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]")
        );

        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Release);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(null)
            .AddReferences(MetadataReferences.GetEntitiesAssemblyReferences())
            .AddSyntaxTrees(syntaxTrees)
            .WithOptions(options);

        using var dllStream = new MemoryStream(1024);
        var emitResult = compilation.Emit(dllStream);
        CodeGeneratorUtil.CheckEmitResult(emitResult);

        //先压缩
        dllStream.Position = 0;
        using var os = new MemoryStream(1024);
        await using var cs = new BrotliStream(os, CompressionMode.Compress, true);
        await dllStream.CopyToAsync(cs);
        await cs.FlushAsync();
        var asmData = os.ToArray();
        appAssemblies.Add($"{appName}.Entities", asmData);

        //再创建MetadataReference
        dllStream.Position = 0;
        var entitiesMetadataReference = MetadataReference.CreateFromStream(dllStream);
        return entitiesMetadataReference;
    }

    private static async Task BuildViewsAssembly(DesignHub hub, string appName, IList<ModelNode> models,
        Dictionary<string, byte[]> appAssemblies, MetadataReference? entitiesMetadataReference)
    {
        if (models.Count == 0) return;

        var srcPrjId = hub.TypeSystem.ViewsProjectId;
        var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);

        var syntaxTrees = new List<SyntaxTree>();

        foreach (var modelNode in models)
        {
            var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;
            var semanticModel = await srcDocument.GetSemanticModelAsync();
            var codegen = await ViewCsGenerator.Make(hub, modelNode);
            var newTree = await codegen.GetRuntimeSyntaxTree();
            syntaxTrees.Add(newTree);
        }

        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        syntaxTrees.Add(SyntaxFactory.ParseSyntaxTree(
            CodeUtil.ViewGlobalUsings() +
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]")
        );

        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Release);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(null)
            .AddReferences(MetadataReferences.GetViewsAssemblyReferences())
            .AddSyntaxTrees(syntaxTrees)
            .WithOptions(options);
        if (entitiesMetadataReference != null)
            compilation = compilation.AddReferences(entitiesMetadataReference);

        using var dllStream = new MemoryStream(1024);
        await using var cs = new BrotliStream(dllStream, CompressionMode.Compress, true);
        var emitResult = compilation.Emit(cs);
        await cs.FlushAsync();
        CodeGeneratorUtil.CheckEmitResult(emitResult);

        var asmData = dllStream.ToArray();
        appAssemblies.Add($"{appName}.Views", asmData);
    }
}