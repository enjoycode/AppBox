using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using RoslynUtils;

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
        _typeSymbolCache = new TypeSymbolCache(semanticModel);
    }

    internal readonly DesignHub DesignHub;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ServiceModel ServiceModel;

    /// <summary>
    /// 用于转换查询方法的Lambda表达式
    /// </summary>
    private readonly QueryMethodContext queryMethodCtx = new();

    /// <summary>
    /// 公开的服务方法集合
    /// </summary>
    private readonly List<MethodDeclarationSyntax> _publicMethods = new();

    /// <summary>
    /// 公开的服务方法的调用权限，key=方法名称，value=已经生成的验证代码
    /// </summary>
    private readonly Dictionary<string, string> _publicMethodsInvokePermissions = new();

    #region ====Usages====

    /// <summary>
    /// 服务模型使用到的实体模型
    /// </summary>
    private readonly HashSet<string> _usedEntities = new();

    private void AddUsedEntity(string fullName) => _usedEntities.Add(fullName);

    /// <summary>
    /// 获取使用的其他模型生成的运行时代码
    /// </summary>
    internal IEnumerable<SyntaxTree>? GetUsagesTree()
    {
        if (_usedEntities.Count == 0) return null;

        //开始生成依赖模型的运行时代码
        var ctx = new Dictionary<string, SyntaxTree>();
        foreach (var usedEntity in _usedEntities)
        {
            var modelNode = DesignHub.DesignTree.FindModelNodeByFullName(usedEntity)!;
            CodeGeneratorUtil.BuildUsagedEntity(DesignHub, modelNode, ctx,
                TypeSystem.ServiceParseOptions);
        }

        return ctx.Values;
    }

    #endregion

    #region ====Type Symbols====

    private readonly TypeSymbolCache _typeSymbolCache;

    private INamedTypeSymbol TypeOfIListGeneric =>
        _typeSymbolCache.GetTypeByName("System.Collections.Generic.IList`1");

    private INamedTypeSymbol TypeOfListGeneric =>
        _typeSymbolCache.GetTypeByName("System.Collections.Generic.List`1");

    #endregion
}