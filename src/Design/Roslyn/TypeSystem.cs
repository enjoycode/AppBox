using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 每个开发人员的设计时上下文对应一个TypeSystem实例
/// </summary>
internal sealed class TypeSystem : IDisposable
{
    internal readonly ModelWorkspace Workspace;

    /// <summary>
    /// 通用模型的虚拟工程标识号
    /// </summary>
    internal readonly ProjectId ModelProjectId;

    /// <summary>
    /// 用于Web的视图模型的虚拟工程标识号
    /// </summary>
    internal readonly ProjectId WebViewsProjectId;

    public TypeSystem()
    {
        Workspace = new ModelWorkspace(new HostServicesAggregator());

        ModelProjectId = ProjectId.CreateNewId();
        WebViewsProjectId = ProjectId.CreateNewId();

        var dllCompilationOptions =
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
                .WithNullableContextOptions(NullableContextOptions.Enable);
        var parseOptions = new CSharpParseOptions()
            .WithLanguageVersion(LanguageVersion.CSharp10);
        var webParseOptions = parseOptions.WithPreprocessorSymbols("__WEB__");

        var modelProjectInfo = ProjectInfo.Create(ModelProjectId, VersionStamp.Create(),
            "ModelProject", "ModelProject", LanguageNames.CSharp, null, null,
            dllCompilationOptions, parseOptions);
        var webViewsProjectInfo = ProjectInfo.Create(WebViewsProjectId, VersionStamp.Create(),
            "ViewsProject", "ViewsProject", LanguageNames.CSharp, null, null,
            dllCompilationOptions, webParseOptions);

        var newSolution = Workspace.CurrentSolution
                //通用模型工程
                .AddProject(modelProjectInfo)
                .AddMetadataReference(ModelProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.SystemRuntimeLib)
                //专用于Web视图模型的工程
                .AddProject(webViewsProjectInfo)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.NetstandardLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.SystemRuntimeLib)
                .AddMetadataReference(WebViewsProjectId, MetadataReferences.PixUIWebLib)
            ;

        if (!Workspace.TryApplyChanges(newSolution))
            throw new Exception("Can't init workspace");
    }

    /// <summary>
    /// Create model's roslyn document
    /// </summary>
    internal async ValueTask CreateModelDocumentAsync(ModelNode node)
    {
        Solution? newSolution = null;
        var appName = node.AppNode.Model.Name;
        var model = node.Model;
        var docId = node.RoslynDocumentId;

        switch (model.ModelType)
        {
            case ModelType.View:
            {
                var docName = $"{appName}.Views.{model.Name}.cs";
                //TODO:get source from StagedService or ModelStore
                var src = $@"using PixUI;

public sealed class {model.Name} : View
{{
    public {model.Name}()
    {{
        Child = new Text(nameof({model.Name}));
    }}
}}";
                newSolution = Workspace.CurrentSolution.AddDocument(docId!, docName, src);
                break;
            }
        }

        if (newSolution != null)
        {
            if (!Workspace.TryApplyChanges(newSolution))
                throw new Exception($"Can't add roslyn document for: {model.Name}");
        }
    }

    public void Dispose()
    {
        Workspace.Dispose();
    }
}