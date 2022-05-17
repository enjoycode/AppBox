using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 每个开发人员的设计时上下文对应一个TypeSystem实例
/// </summary>
internal sealed class TypeSystem
{
    internal readonly ModelWorkspace Workspace;

    /// <summary>
    /// 通用模型的虚拟工程标识号
    /// </summary>
    internal readonly ProjectId ModelProjectId;

    /// <summary>
    /// 视图模型的虚拟工程标识号
    /// </summary>
    internal readonly ProjectId ViewsProjectId;

    public TypeSystem()
    {
        Workspace = new ModelWorkspace(new HostServicesAggregator());

        ModelProjectId = ProjectId.CreateNewId();
        ViewsProjectId = ProjectId.CreateNewId();

        var dllCompilationOptions =
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary);
        var modelProjectInfo = ProjectInfo.Create(ModelProjectId, VersionStamp.Create(),
            "ModelProject", "ModelProject", LanguageNames.CSharp, null, null,
            dllCompilationOptions);
        var viewsProjectInfo = ProjectInfo.Create(ViewsProjectId, VersionStamp.Create(),
            "ViewsProject", "ViewsProject", LanguageNames.CSharp, null, null,
            dllCompilationOptions);

        var newSolution = Workspace.CurrentSolution
                .AddProject(modelProjectInfo)
                .AddMetadataReference(ModelProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ModelProjectId, MetadataReferences.NetstandardLib)
                .AddProject(viewsProjectInfo)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.CoreLib)
                .AddMetadataReference(ViewsProjectId, MetadataReferences.NetstandardLib)
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
                var src = $@"public sealed class {model.Name}
{{
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
}