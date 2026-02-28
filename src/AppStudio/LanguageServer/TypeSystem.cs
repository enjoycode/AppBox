using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// Roslyn的Workspace及各个Project的管理，每个开发人员的设计时上下文对应一个TypeSystem实例
/// </summary>
internal sealed class TypeSystem : IDisposable
{
    public TypeSystem(DesignHub designHub)
    {
        DesignHub = designHub;
        Workspace = new ModelWorkspace(new HostServicesAggregator());

        ModelProjectId = ProjectId.CreateNewId();
        ViewsProjectId = ProjectId.CreateNewId();
        ServiceBaseProjectId = ProjectId.CreateNewId();
        ServiceProxyProjectId = ProjectId.CreateNewId();

        InitWorkspace();
    }

    internal readonly DesignHub DesignHub;

    //统一AssemblyName,方便ModelProject InternalVisibleTo
    private const string DesignTimeServiceAssemblyName = "DesignTimeService";

    private const string MODEL_BASE_CODE =
        $"using System.Runtime.CompilerServices;[assembly: InternalsVisibleTo(\"{DesignTimeServiceAssemblyName}\")]";

    internal readonly ModelWorkspace Workspace;

    /// <summary>
    /// 通用模型的虚拟工程标识
    /// </summary>
    internal readonly ProjectId ModelProjectId;

    /// <summary>
    /// 用于Web的视图模型的虚拟工程标识
    /// </summary>
    internal readonly ProjectId ViewsProjectId;

    /// <summary>
    /// 服务模型的通用虚拟工程标识
    /// </summary>
    internal readonly ProjectId ServiceBaseProjectId;

    /// <summary>
    /// 服务代理虚拟工程标识号
    /// </summary>
    internal readonly ProjectId ServiceProxyProjectId;

    private static readonly CSharpCompilationOptions DllCompilationOptions =
        new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
            .WithNullableContextOptions(NullableContextOptions.Enable);

    internal static readonly CSharpParseOptions ParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp12);

    internal static readonly CSharpParseOptions ServiceParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp12)
            .WithPreprocessorSymbols("__RUNTIME__", "__HOSTRUNTIME__");

    internal static readonly CSharpParseOptions ViewParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp12)
            .WithPreprocessorSymbols("__RUNTIME__");

    /// <summary>
    /// 初始化虚拟工程
    /// </summary>
    private void InitWorkspace()
    {
        var modelProjectInfo = ProjectInfo.Create(ModelProjectId, VersionStamp.Create(),
            "ModelProject", "ModelProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);
        var serviceProxyProjectInfo = ProjectInfo.Create(ServiceProxyProjectId,
            VersionStamp.Create(),
            "ServiceProxyProject", "ServiceProxyProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);
        var viewsProjectInfo = ProjectInfo.Create(ViewsProjectId, VersionStamp.Create(),
            "ViewsProject", "ViewsProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);
        var serviceBaseProjectInfo = ProjectInfo.Create(ServiceBaseProjectId,
            VersionStamp.Create(),
            "ServiceBaseProject", "ServiceBaseProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);

        var newSolution = Workspace.CurrentSolution
                //通用模型工程
                .AddProject(modelProjectInfo)
                .AddMetadataReference(ModelProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.SystemDataLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.AppBoxCoreLib)
                .AddDocument(DocumentId.CreateNewId(ModelProjectId), "ModelBase.cs", MODEL_BASE_CODE)
                //服务代理工程
                .AddProject(serviceProxyProjectInfo)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemJsonLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemPrivateUriLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemNetHttpLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemNetHttpJsonLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(ServiceProxyProjectId, new ProjectReference(ModelProjectId))
                .AddDocument(DocumentId.CreateNewId(ServiceProxyProjectId), "ServiceBase.cs",
                    Resources.LoadString("DummyCode.ServiceProxyDummyCode.cs"))
                //服务通用基础工程
                .AddProject(serviceBaseProjectInfo)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.SystemDataLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(ServiceBaseProjectId, new ProjectReference(ModelProjectId))
                .AddDocument(DocumentId.CreateNewId(ServiceBaseProjectId), "ServiceBase.cs",
                    Resources.LoadString("DummyCode.ServiceBaseDummyCode.cs"))
                //视图模型的工程
                .AddProject(viewsProjectInfo)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemCollectionsLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemLinqLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemLinqExpressionsLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemJsonLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.SystemObjectModelLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.PixUILib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.PixUIDrawingLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.PixUIWidgetsLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.MaterialIconsLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.LiveChartsCoreLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.PixUILiveChartsLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(ViewsProjectId, new ProjectReference(ModelProjectId))
                .AddProjectReference(ViewsProjectId, new ProjectReference(ServiceProxyProjectId))
                .AddDocument(DocumentId.CreateNewId(ViewsProjectId), "ViewBase.cs",
                    Resources.LoadString("DummyCode.ViewBaseDummyCode.cs"))
                .AddDocument(DocumentId.CreateNewId(ViewsProjectId), "GlobalUsing.cs",
                    CodeUtil.ViewGlobalUsings())
            ;

        if (!Workspace.TryApplyChanges(newSolution))
            throw new Exception("Can't init workspace");
    }

    #region ====Create/Update/Remove Document====

    /// <summary>
    /// Create model's roslyn document
    /// </summary>
    internal async ValueTask CreateModelDocumentAsync(ModelNode node, string? initSrcCode = null)
    {
        Solution? newSolution = null;
        var appName = node.AppNode.Model.Name;
        var model = node.Model;
        var docId = node.RoslynDocumentId;
        var docName = DocNameUtil.MakeModelDocName(model.Id); //使用模型标识作为文档名称

        switch (model.ModelType)
        {
            case ModelType.Entity:
            {
                var dummyCode = EntityCsGenerator.GenRuntimeCode(node);
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, dummyCode);

                //RxEntity虚拟代码生成
                var rxEntityCode = EntityCsGenerator.GenRxEntityCode(node);
                newSolution = newSolution.AddDocument(node.ExtRoslynDocumentId!, docName, rxEntityCode);
                break;
            }
            case ModelType.View:
            {
                var viewModel = (ViewModel)model;
                if (viewModel.ViewType == ViewModelType.PixUI)
                {
                    var sourceCode = await LoadSourceCode(initSrcCode, node);
                    newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, sourceCode);
                }
                else if (viewModel.ViewType == ViewModelType.PixUIDynamic)
                {
                    //动态视图只需要简单生成虚拟代码
                    var sourceCode = $"namespace {appName}.Views; public sealed class {model.Name}: PixUI.Widget {{}}";
                    newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, sourceCode);
                }

                break;
            }
            case ModelType.Service:
            {
                //服务模型先创建虚拟项目
                CreateServiceProject(node.ServiceProjectId!, (ServiceModel)model, appName);

                var sourceCode = await LoadSourceCode(initSrcCode, node);
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, sourceCode);

                //服务代理的代码生成
                var srcDoc = newSolution.GetDocument(docId)!;
                var proxyCode = await ServiceProxyGenerator.GenServiceProxyCode(srcDoc, appName, (ServiceModel)model);
                newSolution = newSolution.AddDocument(node.ExtRoslynDocumentId!, docName, proxyCode);
                break;
            }
            case ModelType.Permission:
            {
                //服务端代码生成
                var dummyCode = PermissionCodeGenerator.GenServerCode((PermissionModel)model, appName);
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, dummyCode);

                //客户端代码生成
                var clientCode = PermissionCodeGenerator.GenClientCode((PermissionModel)model, appName);
                newSolution = newSolution.AddDocument(node.ExtRoslynDocumentId!, docName, clientCode);
                break;
            }
        }

        if (newSolution != null)
        {
            if (!Workspace.TryApplyChanges(newSolution))
                throw new Exception($"Can't add roslyn document for: {model.Name}");
        }
    }

    /// <summary>
    /// 获取模型节点代码，如果是新建的节点使用初始化代码，如果是已签出的先尝试从Staged中获取，最后从MetaStore获取
    /// </summary>
    internal async Task<string> LoadSourceCode(string? initSrcCode, ModelNode node)
    {
        var sourceCode = initSrcCode;
        if (string.IsNullOrEmpty(sourceCode))
        {
            if (node.IsCheckoutByMe) //已签出尝试从Staged中加载
                sourceCode = await DesignHub.StagedService.LoadCodeAsync(node.Model.Id);
            if (string.IsNullOrEmpty(sourceCode)) //从MetaStore加载
                sourceCode = await DesignHub.MetaStoreService.LoadModelCodeAsync(node.Model.Id);
        }

        return sourceCode ?? string.Empty;
    }

    /// <summary>
    /// 更新模型RoslynDocument，注意：服务模型也会更新，如不需要由调用者忽略
    /// </summary>
    internal ValueTask UpdateModelDocumentAsync(ModelNode node)
    {
        if (node.RoslynDocumentId == null)
            return ValueTask.CompletedTask;

        var appName = node.AppNode.Model.Name;
        var model = node.Model;
        var docId = node.RoslynDocumentId;

        Solution? newSolution = null;
        //TODO: others
        switch (model.ModelType)
        {
            case ModelType.Entity:
            {
                var sourceCode = EntityCsGenerator.GenRuntimeCode(node);
                newSolution = Workspace.CurrentSolution.WithDocumentText(docId, SourceText.From(sourceCode));

                //RxEntity虚拟代码生成
                var rxEntityCode = EntityCsGenerator.GenRxEntityCode(node);
                newSolution = newSolution.WithDocumentText(node.ExtRoslynDocumentId!, SourceText.From(rxEntityCode));
                break;
            }
            case ModelType.Enum:
                //TODO:
                // newSolution = Workspace.CurrentSolution.WithDocumentText(docId,
                //                     SourceText.From(CodeGenService.GenEnumDummyCode((EnumModel)model, appName)));
                break;
            case ModelType.Service:
            {
                throw new NotImplementedException();
                // var sourceCode = await MetaStore.Provider.LoadModelCodeAsync(model.Id);
                // newSolution = Workspace.CurrentSolution.WithDocumentText(docId, SourceText.From(sourceCode));
                //
                // // 更新代理类
                // var srcdoc = newSolution.GetDocument(docId)!;
                // var proxyCode = await ServiceProxyGenerator.GenServiceProxyCode(srcdoc, appName, (ServiceModel)model);
                // newSolution = newSolution.WithDocumentText(node.ExtRoslynDocumentId!, SourceText.From(proxyCode));
                // break;
            }
            case ModelType.Permission:
            {
                var dummyCode = PermissionCodeGenerator.GenServerCode((PermissionModel)model, appName);
                newSolution = Workspace.CurrentSolution.WithDocumentText(docId, SourceText.From(dummyCode));
                break;
            }
        }

        if (newSolution != null)
        {
            if (!Workspace.TryApplyChanges(newSolution))
                Log.Warn("Cannot update roslyn document for: " + model.Name);
        }

        return ValueTask.CompletedTask;
    }

    /// <summary>
    /// 仅用于保存服务模型时同步更新服务代理
    /// </summary>
    internal async ValueTask UpdateServiceProxyDocumentAsync(ModelNode node)
    {
        var appName = node.AppNode.Model.Name;
        var model = (ServiceModel)node.Model;
        var srcdoc = Workspace.CurrentSolution.GetDocument(node.RoslynDocumentId)!;
        var proxyCode = await ServiceProxyGenerator.GenServiceProxyCode(srcdoc, appName, model);
        var newSolution = Workspace.CurrentSolution.WithDocumentText(node.ExtRoslynDocumentId!,
            SourceText.From(proxyCode));
        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn("Cannot update service proxy document for: " + model.Name);
    }

    /// <summary>
    /// 用于删除表达式和删除模型时移除相应的RoslynDocument
    /// </summary>
    /// <remarks>
    /// 注意: 如果处于打开状态，则先关闭再移除
    /// </remarks>
    internal void RemoveDocument(DocumentId docId)
    {
        if (Workspace.IsDocumentOpen(docId))
            Workspace.CloseDocument(docId);

        var newSolution = Workspace.CurrentSolution.RemoveDocument(docId);
        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn($"Cannot remove roslyn document for: {docId}");
    }

    #endregion

    #region ====ServiceProject=====

    /// <summary>
    /// 创建服务模型的虚拟项目，即一个服务模型对应一个虚拟项目
    /// </summary>
    private async void CreateServiceProject(ProjectId prjId, ServiceModel model, string appName)
    {
        var prjName = $"{appName}.{model.Name}";

        var serviceProjectInfo = ProjectInfo.Create(prjId, VersionStamp.Create(),
            prjName, DesignTimeServiceAssemblyName, LanguageNames.CSharp, null, null,
            DllCompilationOptions, ServiceParseOptions);

        var deps = new List<MetadataReference> //设计时不加入AppBoxStore引用
        {
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            MetadataReferences.SystemRuntimeLib,
            MetadataReferences.SystemLinqLib,
            MetadataReferences.SystemDataLib,
            MetadataReferences.SystemCollectionsLib,
            MetadataReferences.SystemJsonLib,
            MetadataReferences.SystemPrivateUriLib,
            MetadataReferences.SystemNetHttpLib,
            MetadataReferences.SystemNetHttpJsonLib,
            MetadataReferences.AppBoxCoreLib, //需要解析一些类型
        };

        if (model.HasDependency) //添加其他引用
        {
            foreach (var dependency in model.Dependencies!)
            {
                var metadataReference =
                    await MetadataReferences.TryGet(dependency.Type, dependency.AssemblyName, appName);
                deps.Add(metadataReference);
            }
        }

        var newSolution = Workspace.CurrentSolution
                .AddProject(serviceProjectInfo)
                .AddMetadataReferences(prjId, deps)
                .AddProjectReference(prjId, new ProjectReference(ModelProjectId))
                .AddProjectReference(prjId, new ProjectReference(ServiceBaseProjectId))
                .AddProjectReference(prjId, new ProjectReference(ServiceProxyProjectId))
                .AddDocument(DocumentId.CreateNewId(prjId), "GlobalUsing.cs", CodeUtil.ServiceGlobalUsings())
            ;

        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn("Cannot create service project.");
    }

    internal void RemoveServiceProject(ProjectId serviceProjectId)
    {
        var newSolution = Workspace.CurrentSolution.RemoveProject(serviceProjectId);
        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn("Cannot remove service project.");
    }

    #endregion

    #region ====MetadataReference====

    /// <summary>
    /// 给Project添加MetadataReference，用于设计时添加依赖项后更新
    /// </summary>
    internal async void AddMetadataReference(ProjectId serviceProjectId, ModelDependencyType type,
        string asmName, string? appName = null)
    {
        var metadataReference = await MetadataReferences.TryGet(type, asmName, appName);
        var newSolution = Workspace.CurrentSolution.AddMetadataReference(serviceProjectId, metadataReference);
        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn("Cannot add service project reference.");
    }

    /// <summary>
    /// 给Project移除MetadataReference，用于设计时更新或删除依赖后更新
    /// </summary>
    internal async void RemoveMetadataReference(ProjectId serviceProjectId, ModelDependencyType type,
        string asmName, string? appName = null)
    {
        var metadataReference = await MetadataReferences.TryGet(type, asmName, appName);
        var newSolution = Workspace.CurrentSolution.RemoveMetadataReference(serviceProjectId, metadataReference);
        if (!Workspace.TryApplyChanges(newSolution))
            Log.Warn("Cannot remove service project reference.");
    }

    #endregion

    #region ====Get Symbol Methods====

    /// <summary>
    /// 根据指定的模型类型及标识号获取相应的虚拟类的类型
    /// </summary>
    internal async Task<INamedTypeSymbol?> GetModelSymbolAsync(ModelNode modelNode)
    {
        var modelId = modelNode.Model.Id;
        var modelName = modelNode.Model.Name;
        var doc = Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId);
        if (doc == null)
            return null;

        var syntaxRootNode = await doc.GetSyntaxRootAsync();
        var semanticModel = await doc.GetSemanticModelAsync();

        if (modelId.Type == ModelType.Enum) //TODO:处理枚举等非ClassDeclaration的类型
            throw new NotImplementedException($"获取类型为{modelId.Type}的Symbol");

        var classDeclaration = syntaxRootNode!
            .DescendantNodes()
            .OfType<ClassDeclarationSyntax>()
            .Single(c => c.Identifier.ValueText == modelName);
        return semanticModel.GetDeclaredSymbol(classDeclaration);
    }

    /// <summary>
    /// 根据实体成员的名称获取相应的虚拟实体类的PropertySymbol
    /// </summary>
    internal async Task<IPropertySymbol?> GetEntityMemberSymbolAsync(ModelNode modelNode, string memberName)
    {
        var modelSymbol = await GetModelSymbolAsync(modelNode);
        if (modelSymbol == null) return null;

        return modelSymbol.GetMembers(memberName).SingleOrDefault() as IPropertySymbol;
    }

    /// <summary>
    /// 根据服务方法的名称获取相应的服务类的MethodSymbol
    /// </summary>
    internal async Task<IMethodSymbol?> GetServiceMethodSymbolAsync(ModelNode modelNode, string methodName)
    {
        var modelSymbol = await GetModelSymbolAsync(modelNode);
        if (modelSymbol == null) return null;

        return modelSymbol.GetMembers(methodName).FirstOrDefault() as IMethodSymbol;
    }

    #endregion

    #region ====Debug Methods====

    internal async void DumpAllProjectErrors()
    {
        await DumpProjectErrors(ModelProjectId);
        await DumpProjectErrors(ServiceBaseProjectId);
        await DumpProjectErrors(ServiceProxyProjectId);
        await DumpProjectErrors(ViewsProjectId);
    }

    private async Task DumpProjectErrors(ProjectId projectId)
    {
        var project = Workspace.CurrentSolution.GetProject(projectId);
        var cu = await project!.GetCompilationAsync();
        var errors = cu!.GetDiagnostics();
        foreach (var err in errors)
        {
            if (err.Severity == DiagnosticSeverity.Error)
            {
                var modelName = string.Empty;
                var filePath = err.Location.SourceTree?.FilePath;
                if (filePath != null)
                {
                    var modelId = DocNameUtil.TryGetModelIdFromDocName(filePath);
                    if (modelId != null)
                    {
                        var modelNode = DesignHub.DesignTree.FindModelNode(modelId.Value);
                        if (modelNode != null)
                            modelName = $"{modelNode.AppNode.Label}.{modelNode.Label}";
                    }
                }

                Console.WriteLine($"项目[{project.Name}][{modelName}]存在错误: {err}");
            }
        }
    }

    #endregion

    public void Dispose() => Workspace.Dispose();
}