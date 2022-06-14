using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

/// <summary>
/// 用于转换生成运行时的服务代码
/// </summary>
internal sealed partial class ServiceCodeGenerator : CSharpSyntaxRewriter
{
    internal ServiceCodeGenerator(DesignHub hub, string appName, SemanticModel semanticModel,
        ServiceModel serviceModel)
    {
        DesignHub = hub;
        AppName = appName;
        SemanticModel = semanticModel;
        ServiceModel = serviceModel;
    }

    internal readonly DesignHub DesignHub;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ServiceModel ServiceModel;

    /// <summary>
    /// 公开的服务方法集合
    /// </summary>
    private readonly List<MethodDeclarationSyntax> _publicMethods = new();

    /// <summary>
    /// 公开的服务方法的调用权限，key=方法名称，value=已经生成的验证代码
    /// </summary>
    private readonly Dictionary<string, string> _publicMethodsInvokePermissions = new();
}