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
    internal ViewCodeGenerator(DesignHub hub, string appName, SemanticModel semanticModel,
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

    #region ====Usages====

    /// <summary>
    /// 视图模型使用到的实体模型及其他视图模型
    /// </summary>
    private readonly HashSet<string> _usedModels = new();

    private void AddUsedModel(string fullName) => _usedModels.Add(fullName);

    /// <summary>
    /// 获取使用的其他模型生成的运行时代码
    /// </summary>
    internal IEnumerable<SyntaxTree>? GetUsagesTree()
    {
        if (_usedModels.Count == 0) return null;

        //开始生成依赖模型的运行时代码
        var ctx = new Dictionary<string, SyntaxTree>();
        foreach (var usedModel in _usedModels)
        {
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(usedModel)!;
            var modelType = modelNode.Model.ModelType;
            if (modelType == ModelType.Entity)
            {
                CodeGeneratorUtil.BuildUsagedEntity(DesignHub, modelNode, ctx,
                    TypeSystem.ViewParseOptions);
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        return ctx.Values;
    }

    #endregion
}