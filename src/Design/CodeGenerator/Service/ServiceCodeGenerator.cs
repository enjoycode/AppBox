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
        TypeSymbolCache = new TypeSymbolCache(semanticModel);
    }

    internal readonly DesignHub DesignHub;
    internal readonly string AppName;
    internal readonly SemanticModel SemanticModel;
    internal readonly ServiceModel ServiceModel;

    internal readonly TypeSymbolCache TypeSymbolCache;

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

    internal void AddUsedEntity(string fullName) => _usedEntities.Add(fullName);

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

    #region ====Interceptors====

    private static readonly Dictionary<string, IInvocationInterceptor<SyntaxNode>>
        invocationInterceptors;

    private static readonly Dictionary<string, IMemberAccessInterceptor<SyntaxNode>>
        memberAccessInterceptors;

    static ServiceCodeGenerator()
    {
        invocationInterceptors = new Dictionary<string, IInvocationInterceptor<SyntaxNode>>
        {
            { CallServiceInterceptor.Name, new CallServiceInterceptor() }
        };

        memberAccessInterceptors = new();
    }

    private static IInvocationInterceptor<SyntaxNode>? GetInvocationInterceptor(ISymbol? symbol)
    {
        if (symbol == null) return null;

        var attributes = symbol.GetAttributes();
        foreach (var item in attributes)
        {
            if (item.AttributeClass != null && item.AttributeClass.ToString() ==
                TypeHelper.InvocationInterceptorAttribute)
            {
                var key = item.ConstructorArguments[0].Value!.ToString();
                if (!invocationInterceptors.TryGetValue(key,
                        out IInvocationInterceptor<SyntaxNode> interceptor))
                    Log.Debug($"未能找到InvocationInterceptor: {key}");
                return interceptor;
            }
        }

        return null;
    }

    private static IMemberAccessInterceptor<SyntaxNode>? GetMemberAccessInterceptor(ISymbol? symbol)
    {
        if (symbol == null) return null;

        var attributes = symbol.GetAttributes();
        foreach (var item in attributes)
        {
            if (item.AttributeClass != null && item.AttributeClass.ToString() ==
                TypeHelper.MemberAccessInterceptorAttribute)
            {
                var key = item.ConstructorArguments[0].Value!.ToString();
                if (!memberAccessInterceptors.TryGetValue(key,
                        out IMemberAccessInterceptor<SyntaxNode> interceptor))
                    Log.Debug($"未能找到MemberAccessInterceptor: {key}");
                return interceptor;
            }
        }

        return null;
    }

    #endregion
}