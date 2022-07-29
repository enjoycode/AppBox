using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

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
    }

    internal readonly DesignHub DesignHub;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ViewModel ViewModel;
}