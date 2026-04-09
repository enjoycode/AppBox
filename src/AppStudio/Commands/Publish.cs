using System.Text;
using AppBoxClient;
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
        //将PendingChanges转为PublishPackage, 并保存所有尚未保存的内容
        var package = new PublishPackage();
        var apps = hub.GetApplications();
        foreach (var app in apps)
            package.Apps.Add(app.Id, app.Name);
        foreach (var change in changes)
        {
            switch (change.Target)
            {
                case ModelBase model:
                    package.Models.Add(model);
                    var modelNode = (ModelNode)change.DesignNode!;
                    await modelNode.SaveAsync(null); //TODO: check need save
                    break;
                case ModelFolder folder:
                    package.Folders.Add(folder);
                    //await DesignHub.Current.StagedService.SaveFolderAsync(folder); //TODO: check need save
                    break;
                default:
                    Log.Warn($"Unknown pending change: {change.GetType()}");
                    break;
            }
        }

        //验证模型有效性
        ValidateModels(hub, package);
        //编译模型并上传
        await CompileAndUploadAsync(hub, changes, package);
        //调用服务端发布
        await hub.PublishService.PublishAsync(package, commitMessage);
        //刷新所有CheckoutByMe的节点项
        hub.DesignTree.CheckinAllNodes();
        hub.ClearRemovedItems();
    }

    private static void ValidateModels(DesignHub hub, PublishPackage package)
    {
        //TODO:
    }

    private static async Task CompileAndUploadAsync(DesignHub hub, IList<PendingChange> changes, PublishPackage package)
    {
        var isFirst = true;
        foreach (var item in changes)
        {
            //以下重命名的已不需要加入待删除列表，保存模型时已处理
            if (item.Target is ServiceModel sm && sm.PersistentState != PersistentState.Deleted)
            {
                var tempFileStream = LocalFileSystem.CreateTempFile(out var tempFilePath, false);
                try
                {
                    await CompileServiceAsync(tempFileStream, hub, sm, false);
                    var appName = hub.AppNameGetter(sm.Id.AppId);
                    var fullName = $"{appName}.{sm.Name}";
                    tempFileStream.Seek(0, SeekOrigin.Begin);
                    await hub.PublishService.UploadServiceAssembly(tempFileStream, fullName, isFirst);
                    isFirst = false;
                }
                finally
                {
                    tempFileStream.Close();
                    LocalFileSystem.DeleteTempFile(tempFilePath);
                }
            }
        }
    }

    /// <summary>
    /// 发布或调试时编译服务模型
    /// </summary>
    /// <remarks>
    /// 因Blazor不支持Brotli,所以暂不压缩
    /// </remarks>
    internal static async Task CompileServiceAsync(Stream toStream, DesignHub hub, ServiceModel model, bool forDebug)
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
        if (forDebug)
        {
            var emitOpts = new EmitOptions(false, DebugInformationFormat.Embedded);
            //using var pdbStream = new FileStream(Path.Combine(debugFolder, docName + ".pdb"), FileMode.CreateNew);
            emitResult = compilation.Emit(toStream, null, null, null, null, emitOpts);
        }
        else
        {
            emitResult = compilation.Emit(toStream);
        }

        CodeGeneratorUtil.CheckEmitResult(emitResult);
    }
}