using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using PixUI;
using RoslynUtils;

namespace AppBoxDesign;

/// <summary>
/// 用于转换生成运行时的服务代码
/// </summary>
internal sealed partial class ServiceCodeGenerator : CSharpSyntaxRewriter, ICodeGeneratorWithUsages
{
    internal ServiceCodeGenerator(DesignContext context, string appName, SemanticModel semanticModel,
        ServiceModel serviceModel)
    {
        DesignContext = context;
        AppName = appName;
        SemanticModel = semanticModel;
        ServiceModel = serviceModel;
        TypeSymbolCache = new TypeSymbolCache(semanticModel);
    }

    internal readonly DesignContext DesignContext;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ServiceModel ServiceModel;

    internal readonly TypeSymbolCache TypeSymbolCache;

    /// <summary>
    /// 用于转换查询方法的Lambda表达式
    /// </summary>
    private readonly QueryMethodContext _queryMethodCtx = new();

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
    /// 服务模型使用到的实体模型、枚举模型
    /// </summary>
    private readonly HashSet<string> _usedModel = [];

    private void AddUsedModel(string fullName) => _usedModel.Add(fullName);

    /// <summary>
    /// 根据类型全名称查找是否模型
    /// </summary>
    /// <param name="fullName">eg: sys.Entities.Customer</param>
    private bool FindModel(string fullName)
    {
        var modelNode = DesignContext.DesignTree.FindModelNodeByFullName(fullName);
        return modelNode != null;
    }

    /// <summary>
    /// 获取使用的其他模型生成的运行时代码
    /// </summary>
    internal IEnumerable<SyntaxTree>? GetUsagesTree()
    {
        if (_usedModel.Count == 0) return null;

        //开始生成依赖模型的运行时代码
        var ctx = new Dictionary<string, SyntaxTree>();
        foreach (var usedEntity in _usedModel)
        {
            var modelNode = DesignContext.DesignTree.FindModelNodeByFullName(usedEntity)!;
            switch (modelNode.Model.ModelType)
            {
                case ModelType.Entity:
                    CodeGeneratorUtil.BuildUsedEntity(DesignContext, modelNode, ctx, DesignContext.ServiceParseOptions);
                    break;
                case ModelType.Enum:
                    CodeGeneratorUtil.BuildUsedEnum(DesignContext, modelNode, ctx, DesignContext.ServiceParseOptions);
                    break;
                default:
                    throw new NotImplementedException($"{modelNode.Model.ModelType}");
            }
        }

        return ctx.Values;
    }

    bool ICodeGeneratorWithUsages.FindModel(string fullName) => FindModel(fullName);

    void ICodeGeneratorWithUsages.AddUsedModel(string fullName) => AddUsedModel(fullName);

    ModelType ICodeGeneratorWithUsages.TargetModelType => ModelType.Service;

    #endregion
}