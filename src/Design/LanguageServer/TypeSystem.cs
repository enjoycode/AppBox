using AppBoxCore;
using AppBoxStore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

/// <summary>
/// 每个开发人员的设计时上下文对应一个TypeSystem实例
/// </summary>
internal sealed class TypeSystem : IDisposable
{
    public TypeSystem()
    {
        Workspace = new ModelWorkspace(new HostServicesAggregator());

        ModelProjectId = ProjectId.CreateNewId();
        WebViewsProjectId = ProjectId.CreateNewId();
        ServiceBaseProjectId = ProjectId.CreateNewId();
        ServiceProxyProjectId = ProjectId.CreateNewId();

        InitWorkspace();
    }

    internal readonly ModelWorkspace Workspace;

    /// <summary>
    /// 通用模型的虚拟工程标识
    /// </summary>
    internal readonly ProjectId ModelProjectId;

    /// <summary>
    /// 用于Web的视图模型的虚拟工程标识
    /// </summary>
    internal readonly ProjectId WebViewsProjectId;

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

    private static readonly CSharpParseOptions ParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp10);

    internal static readonly CSharpParseOptions ServiceParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp10)
            .WithPreprocessorSymbols("__RUNTIME__", "__HOSTRUNTIME__");

    internal static readonly CSharpParseOptions ViewParseOptions =
        new CSharpParseOptions().WithLanguageVersion(LanguageVersion.CSharp10)
            .WithPreprocessorSymbols("__RUNTIME__");

    /// <summary>
    /// 初始化虚拟工程
    /// </summary>
    private void InitWorkspace()
    {
        var webParseOptions = ParseOptions.WithPreprocessorSymbols("__WEB__");

        var modelProjectInfo = ProjectInfo.Create(ModelProjectId, VersionStamp.Create(),
            "ModelProject", "ModelProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);
        var serviceProxyProjectInfo = ProjectInfo.Create(ServiceProxyProjectId,
            VersionStamp.Create(),
            "ServiceProxyProject", "ServiceProxyProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, ParseOptions);
        var webViewsProjectInfo = ProjectInfo.Create(WebViewsProjectId, VersionStamp.Create(),
            "ViewsProject", "ViewsProject", LanguageNames.CSharp, null, null,
            DllCompilationOptions, webParseOptions);
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
                .AddMetadataReference(ModelProjectId, MetadataReferences.AppBoxCoreLib)
                //服务代理工程
                .AddProject(serviceProxyProjectInfo)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ServiceProxyProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(ServiceProxyProjectId, new ProjectReference(ModelProjectId))
                .AddDocument(DocumentId.CreateNewId(ServiceProxyProjectId), "ServiceBase.cs",
                    Resources.GetString("DummyCode.ServiceProxyDummyCode.cs"))
                //服务通用基础工程
                .AddProject(serviceBaseProjectInfo)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.SystemDataLib)
                .AddMetadataReference(ServiceBaseProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(ServiceBaseProjectId, new ProjectReference(ModelProjectId))
                .AddDocument(DocumentId.CreateNewId(ServiceBaseProjectId), "ServiceBase.cs",
                    Resources.GetString("DummyCode.ServiceBaseDummyCode.cs"))
                //专用于Web视图模型的工程
                .AddProject(webViewsProjectInfo)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.PixUIWebLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.AppBoxCoreLib)
                .AddProjectReference(WebViewsProjectId, new ProjectReference(ModelProjectId))
                .AddProjectReference(WebViewsProjectId, new ProjectReference(ServiceProxyProjectId))
            ;

        if (!Workspace.TryApplyChanges(newSolution))
            throw new Exception("Can't init workspace");
    }

    #region ====Create/Update/Remove Document====

    private static string MakeModelDocName(in ModelId modelId) => $"M{modelId}.cs";

    /// <summary>
    /// Create model's roslyn document
    /// </summary>
    internal async ValueTask CreateModelDocumentAsync(ModelNode node, string? initSrcCode = null)
    {
        Solution? newSolution = null;
        var appName = node.AppNode.Model.Name;
        var model = node.Model;
        var docId = node.RoslynDocumentId;
        var docName = MakeModelDocName(model.Id); //使用模型标识作为文档名称

        switch (model.ModelType)
        {
            case ModelType.Entity:
            {
                var dummyCode = EntityCodeGenerator.GenEntityRuntimeCode(node);
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, dummyCode);
                break;
            }
            case ModelType.View:
            {
                var sourceCode = await LoadSourceCode(initSrcCode, node);
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, sourceCode);
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
                var proxyCode =
                    await ServiceProxyGenerator.GenServiceProxyCode(srcDoc, appName,
                        (ServiceModel)model);
                newSolution =
                    newSolution.AddDocument(node.ExtRoslynDocumentId!, docName, proxyCode);
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
    private static async Task<string> LoadSourceCode(string? initSrcCode, ModelNode node)
    {
        var sourceCode = initSrcCode;
        if (string.IsNullOrEmpty(sourceCode))
        {
            if (node.IsCheckoutByMe) //已签出尝试从Staged中加载
                sourceCode = await StagedService.LoadCodeAsync(node.Model.Id);
            if (string.IsNullOrEmpty(sourceCode)) //从MetaStore加载
                sourceCode = await MetaStore.Provider.LoadModelCodeAsync(node.Model.Id);
        }

        return sourceCode;
    }

    /// <summary>
    /// 更新模型RoslynDocument，注意：服务模型也会更新，如不需要由调用者忽略
    /// </summary>
    internal async ValueTask UpdateModelDocumentAsync(ModelNode node)
    {
        if (node.RoslynDocumentId == null)
            return;

        var appName = node.AppNode.Model.Name;
        var model = node.Model;
        var docId = node.RoslynDocumentId;

        Solution? newSolution = null;
        //TODO: others
        switch (model.ModelType)
        {
            case ModelType.Entity:
            {
                var sourceCode = EntityCodeGenerator.GenEntityRuntimeCode(node);
                newSolution =
                    Workspace.CurrentSolution.WithDocumentText(docId, SourceText.From(sourceCode));
                break;
            }
            case ModelType.Enum:
                //TODO:
                // newSolution = Workspace.CurrentSolution.WithDocumentText(docId,
                //                     SourceText.From(CodeGenService.GenEnumDummyCode((EnumModel)model, appName)));
                break;
            case ModelType.Service:
            {
                var sourceCode = await MetaStore.Provider.LoadModelCodeAsync(model.Id);
                newSolution =
                    Workspace.CurrentSolution.WithDocumentText(docId, SourceText.From(sourceCode));

                // 服务模型还需要更新代理类
                var srcdoc = newSolution.GetDocument(docId)!;
                var proxyCode =
                    await ServiceProxyGenerator.GenServiceProxyCode(srcdoc, appName,
                        (ServiceModel)model);
                newSolution = newSolution.WithDocumentText(node.ExtRoslynDocumentId!,
                    SourceText.From(proxyCode));
                break;
            }
        }

        if (newSolution != null)
        {
            if (!Workspace.TryApplyChanges(newSolution))
                Log.Warn("Cannot update roslyn document for: " + model.Name);
        }
    }

    /// <summary>
    /// 仅用于保存服务模型时同步更新服务代理
    /// </summary>
    internal async ValueTask UpdateServiceProxyDocumentAsync(ModelNode node)
    {
        var appName = node.AppNode.Model.Name;
        var model = (ServiceModel)node.Model;
        var srcdoc = Workspace.CurrentSolution.GetDocument(node.RoslynDocumentId)!;
        var proxyCode =
            await ServiceProxyGenerator.GenServiceProxyCode(srcdoc, appName, model);
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
    private void CreateServiceProject(ProjectId prjId, ServiceModel model, string appName)
    {
        var prjName = $"{appName}.{model.Name}";

        var serviceProjectInfo = ProjectInfo.Create(prjId, VersionStamp.Create(),
            prjName, prjName, LanguageNames.CSharp, null, null,
            DllCompilationOptions, ServiceParseOptions);

        var deps = new List<MetadataReference>
        {
            MetadataReferences.CoreLib,
            MetadataReferences.NetstandardLib,
            MetadataReferences.SystemRuntimeLib,
            MetadataReferences.SystemLinqLib,
            // MetadataReferences.SystemRuntimeExtLib,
            MetadataReferences.SystemDataLib,
            // MetadataReferences.ComponentModelPrimitivesLib,
            // MetadataReferences.SystemBuffersLib,
            // MetadataReferences.SystemTasksLib,
            // MetadataReferences.TasksExtLib,
            MetadataReferences.AppBoxCoreLib, //需要解析一些类型
        };

        if (model.HasReference) //添加其他引用
        {
            throw new NotImplementedException();
            // for (int i = 0; i < model.References.Count; i++)
            // {
            //     deps.Add(MetadataReferences.Get($"{model.References[i]}.dll", appName));
            // }
        }

        var globalUsingDocId = DocumentId.CreateNewId(prjId);
        var newSolution = Workspace.CurrentSolution
                .AddProject(serviceProjectInfo)
                .AddMetadataReferences(prjId, deps)
                .AddProjectReference(prjId, new ProjectReference(ModelProjectId))
                .AddProjectReference(prjId, new ProjectReference(ServiceBaseProjectId))
                .AddProjectReference(prjId, new ProjectReference(ServiceProxyProjectId))
                .AddDocument(globalUsingDocId, "GlobalUsing.cs", CodeUtil.ServiceGlobalUsings())
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

    internal async Task<IPropertySymbol?> GetEntityMemberSymbolAsync(ModelNode modelNode,
        string memberName)
    {
        var modelSymbol = await GetModelSymbolAsync(modelNode);
        if (modelSymbol == null) return null;

        return modelSymbol.GetMembers(memberName).SingleOrDefault() as IPropertySymbol;
    }

    #endregion

    #region ====Debug Methods====

    internal async void DumpAllProjectErrors()
    {
        await DumpProjectErrors(ModelProjectId);
        await DumpProjectErrors(ServiceBaseProjectId);
        await DumpProjectErrors(ServiceProxyProjectId);
    }

    private async Task DumpProjectErrors(ProjectId projectId)
    {
        var project = Workspace.CurrentSolution.GetProject(projectId);
        var cu = await project!.GetCompilationAsync();
        var errors = cu!.GetDiagnostics();
        foreach (var err in errors)
        {
            if (err.Severity == DiagnosticSeverity.Error)
                Console.WriteLine("项目[{0}]存在错误: {1}", project.Name, err);
        }
    }

    #endregion

    public void Dispose() => Workspace.Dispose();
}