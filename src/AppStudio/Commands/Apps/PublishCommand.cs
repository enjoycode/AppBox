using System.Text;
using AppBoxClient;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Emit;
using PixUI;

namespace AppBoxDesign;

internal sealed class PublishCommand : DesignCommand
{
    public PublishCommand(DesignHub context) : base(context) { }

    public void Execute() => new PublishDialog(Context).Show();

    internal static async Task Publish(DesignHub context, IList<PendingChange> changes, string commitMessage)
    {
        //将PendingChanges转为PublishPackage, 并保存所有尚未保存的内容
        var package = new PublishPackage();
        var apps = context.GetApplications();
        foreach (var app in apps)
            package.Apps.Add(app.Id, app.Name);
        foreach (var change in changes)
        {
            switch (change.Target)
            {
                case ModelBase model:
                    package.Models.Add(model);
                    if (change.ChangeType != PendingChangeType.Deleted) //已删除的模型节点已经保存过了
                    {
                        var modelNode = (ModelNode)change.DesignNode!;
                        //保存尚未保存的模型代码 //TODO: check is unsaved
                        await modelNode.SaveAsync(null);
                    }

                    break;
                case ModelFolder folder:
                    package.Folders.Add(folder);
                    //不再需要保存，增删改文件夹时已保存
                    break;
                default:
                    Log.Warn($"Unknown pending change: {change.GetType()}");
                    break;
            }
        }

        //验证模型有效性
        ValidateModels(context, package);
        //编译模型并上传
        await CompileAndUploadAsync(context, changes, package);
        //调用服务端发布
        await context.PublishService.PublishAsync(package, commitMessage);
        //刷新所有CheckoutByMe的节点项
        context.DesignTree.CheckinAllNodes();
        context.ClearRemovedItems();
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
                var tempFile = await LocalFileSystem.CreateTempFile(false);
                try
                {
                    await CompileServiceAsync(tempFile.FileStream, hub, sm, false);
                    var appName = hub.AppNameGetter(sm.Id.AppId);
                    var fullName = $"{appName}.{sm.Name}";
                    tempFile.FileStream.Seek(0, SeekOrigin.Begin);
                    await hub.PublishService.UploadServiceAssembly(tempFile.FileStream, fullName, isFirst);
                    isFirst = false;
                }
                finally
                {
                    await tempFile.Close();
                    await LocalFileSystem.DeleteTempFile(tempFile.FilePath);
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