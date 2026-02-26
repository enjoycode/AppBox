using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using PixUI;

namespace AppBoxDesign;

internal static class Publish
{
    internal static async Task Execute(IList<PendingChange> changes, string commitMessage)
    {
        var hub = DesignHub.Current;
        //将PendingChanges转为PublishPackage
        var package = new PublishPackage();
        foreach (var change in changes)
        {
            switch (change.Type)
            {
                case StagedType.Model:
                    package.Models.Add((ModelBase)change.Target!);
                    break;
                case StagedType.Folder:
                    package.Folders.Add((ModelFolder)change.Target!);
                    break;
                case StagedType.SourceCode:
                    package.SourceCodes.Add(change.Id, await GetSourceCode(hub, change.Target as ModelNode));
                    break;
                default:
                    Log.Warn($"Unknown pending change: {change.GetType()}");
                    break;
            }
        }

        //验证模型有效性
        ValidateModels(hub, package);
        //编译模型
        await CompileModelsAsync(hub, changes, package);
        //调用服务端发布
        await hub.PublishService.PublishAsync(package, commitMessage);
        //刷新所有CheckoutByMe的节点项
        hub.DesignTree.CheckinAllNodes();
        hub.ClearRemovedItems();
    }

    private static async ValueTask<string?> GetSourceCode(DesignHub hub, ModelNode? modelNode)
    {
        if (modelNode == null)
            return null;

        if (modelNode.Model is ViewModel { ViewType: ViewModelType.PixUIDynamic })
            return null; //由服务端暂存
        if (modelNode.Model is ReportModel)
            return null; //由服务端暂存

        var roslynDoc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId)!;
        var source = await roslynDoc.GetTextAsync();
        return source.ToString();
    }

    private static void ValidateModels(DesignHub hub, PublishPackage package)
    {
        //TODO:
    }

    private static async Task CompileModelsAsync(DesignHub hub, IList<PendingChange> changes, PublishPackage package)
    {
        foreach (var item in changes)
        {
            //以下重命名的已不需要加入待删除列表，保存模型时已处理
            if (item.Type == StagedType.SourceCode &&
                item.Target is ModelNode modelNode &&
                modelNode.Model is ServiceModel sm &&
                sm.PersistentState != PersistentState.Deleted)
            {
                var asmData = await CompileServiceAsync(hub, sm, false);
                var appName = hub.DesignTree.FindApplicationNode(sm.Id.AppId)!.Model.Name;
                var fullName = $"{appName}.{sm.Name}";

                package.ServiceAssemblies.Add(fullName, asmData!);
            }
        }
    }

    /// <summary>
    /// 发布或调试时编译服务模型
    /// </summary>
    /// <remarks>
    /// 因Blazor不支持Brotli,所以暂不压缩
    /// </remarks>
    internal static async Task<byte[]?> CompileServiceAsync(DesignHub hub, ServiceModel model, bool forDebug)
    {
        var designNode = hub.DesignTree.FindModelNode(model.Id)!;
        var appName = designNode.AppNode.Model.Name;

        //获取RoslynDocument并检测语义错误
        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(designNode.RoslynDocumentId)!;
        var semanticModel = await doc.GetSemanticModelAsync();
        if (semanticModel == null) throw new Exception("Can't get SemanticModel");
        CodeGeneratorUtil.CheckSemantic(semanticModel, designNode);

        //转换服务模型的虚拟代码为运行时代码
        var codegen = new ServiceCodeGenerator(hub, appName, semanticModel, model);
        var newRootNode = codegen.Visit(await semanticModel.SyntaxTree.GetRootAsync());
        //Log.Debug(newRootNode.ToFullString());

        var docName = $"{appName}.Services.{model.Name}";
        var newTree = SyntaxFactory.SyntaxTree(newRootNode, path: docName + ".cs",
            options: TypeSystem.ParseOptions,
            encoding: Encoding.UTF8);

        //生成服务模型依赖的其他模型的运行时代码
        var usagesTree = codegen.GetUsagesTree();

        //注意：必须添加并更改版本号，否则服务端Assembly.Load始终是旧版 
        var newModelVersion = model.Version + 1; //用于消除版本差
        var asmVersion = $"{newModelVersion >> 24}.{(newModelVersion >> 16) & 0xFF}.{newModelVersion & 0xFFFF}";
        var usingAndVersionTree = SyntaxFactory.ParseSyntaxTree(
            CodeUtil.ServiceGlobalUsings() +
            $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly: AssemblyVersion(\"{asmVersion}\")]",
            TypeSystem.ParseOptions);
        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary /*, false*/)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(forDebug ? OptimizationLevel.Debug : OptimizationLevel.Release);

        //开始编译运行时代码
        var deps = await MetadataReferences.GetServiceModelReferences(model, appName);
        var compilation = CSharpCompilation.Create(docName)
            .AddReferences(deps)
            .AddSyntaxTrees(newTree, usingAndVersionTree)
            .WithOptions(options);
        if (usagesTree != null)
            compilation = compilation.AddSyntaxTrees(usagesTree);

        EmitResult emitResult;
        byte[] asmData;
        if (forDebug)
        {
            using var dllStream = new MemoryStream(1024);
            var emitOpts = new EmitOptions(false, DebugInformationFormat.Embedded);
            //using var pdbStream = new FileStream(Path.Combine(debugFolder, docName + ".pdb"), FileMode.CreateNew);
            emitResult = compilation.Emit(dllStream, null, null, null, null, emitOpts);
            asmData = dllStream.ToArray();
        }
        else
        {
            using var dllStream = new MemoryStream(1024);
            emitResult = compilation.Emit(dllStream);
            asmData = dllStream.ToArray();
        }

        CodeGeneratorUtil.CheckEmitResult(emitResult);

        return asmData;
    }
}