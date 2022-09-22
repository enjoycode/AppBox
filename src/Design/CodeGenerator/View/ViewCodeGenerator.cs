using System.Diagnostics;
using System.Text;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using RoslynUtils;

namespace AppBoxDesign;

/// <summary>
/// 转换生成运行时的视图模型的代码,用于调试与桌面端预览
/// </summary>
internal sealed partial class ViewCodeGenerator : CSharpSyntaxRewriter
{
    internal static async Task<ViewCodeGenerator> Make(DesignHub hub, ModelNode modelNode)
    {
        Debug.Assert(modelNode.Model.ModelType == ModelType.View);

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
        return new ViewCodeGenerator(hub, appName, semanticModel, (ViewModel)modelNode.Model);
    }


    private ViewCodeGenerator(DesignHub hub, string appName, SemanticModel semanticModel,
        ViewModel viewModel)
    {
        DesignHub = hub;
        AppName = appName;
        SemanticModel = semanticModel;
        ViewModel = viewModel;
        _typeSymbolCache = new TypeSymbolCache(semanticModel);
    }

    internal readonly DesignHub DesignHub;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ViewModel ViewModel;
    private readonly TypeSymbolCache _typeSymbolCache;

    /// <summary>
    /// 转换生成运行时的SyntaxTree
    /// </summary>
    internal async Task<SyntaxTree> GetRuntimeSyntaxTree()
    {
        var newRootNode = Visit(await SemanticModel.SyntaxTree.GetRootAsync());
        var docName = $"{AppName}.Views.{ViewModel.Name}";
        return SyntaxFactory.SyntaxTree(newRootNode, path: docName + ".cs",
            encoding: Encoding.UTF8);
    }

    #region ====Usages====

    /// <summary>
    /// 视图模型使用到的实体模型及其他视图模型
    /// </summary>
    private readonly HashSet<string> _usedModels = new();

    /// <summary>
    /// 添加使用到的实体或视图模型
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Customer</param>
    private void AddUsedModel(string fullName) => _usedModels.Add(fullName);

    /// <summary>
    /// 获取使用的其他模型生成的运行时代码
    /// </summary>
    internal async Task BuildUsages(Dictionary<string, SyntaxTree> ctx)
    {
        if (_usedModels.Count == 0) return;

        //开始生成依赖模型的运行时代码
        foreach (var usedModel in _usedModels)
        {
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(usedModel)!;
            var modelType = modelNode.Model.ModelType;

            if (ctx.ContainsKey(modelNode.Id)) continue;

            if (modelType == ModelType.Entity)
            {
                CodeGeneratorUtil.BuildUsagedEntity(DesignHub, modelNode, ctx,
                    TypeSystem.ViewParseOptions);
            }
            else if (modelType == ModelType.View)
            {
                var codeGen = await Make(DesignHub, modelNode);
                ctx.Add(modelNode.Id, await codeGen.GetRuntimeSyntaxTree());
                await codeGen.BuildUsages(ctx);
            }
            else
            {
                throw new NotImplementedException();
            }
        }
    }

    #endregion
}