using System.IO.Compression;
using AppBoxCore;
using AppBoxStore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 生成客户端应用的程序集
/// </summary>
internal sealed class BuildApp : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        //TODO:*****目前简单实现，待实现从HomePage的路由表开始分析引用关系，仅生成用到的模型的程序集
        //TODO:检查签出情况，如有其他签出返回警告

        var force = args.GetBool(); //是否强制生成,目前保留
        var ctx = new BuildContext(hub);

        //先转换各视图模型的运行时代码
        for (var i = 0; i < hub.DesignTree.AppRootNode.Children.Count; i++)
        {
            var appNode = hub.DesignTree.AppRootNode.Children[i];
            //生成视图模型程序集
            var viewRootNode = appNode.FindModelRootNode(ModelType.View);
            var viewModels = viewRootNode.GetAllModelNodes();
            foreach (var viewModelNode in viewModels)
            {
                await BuildViewModel(viewModelNode, ctx);
            }
        }

        //保存入元数据
        // await using var txn = await SqlStore.Default.BeginTransactionAsync();
        // foreach (var kv in appAssemblies)
        // {
        //     Log.Debug($"Assembly: {kv.Key} 压缩后: {kv.Value.Length}");
        //     await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.Application, kv.Key, kv.Value, txn);
        // }
        //
        // await txn.CommitAsync();

        return AnyValue.From(true);
    }

    /// <summary>
    /// 从视图模型开始分析引用关系
    /// </summary>
    private static async Task BuildViewModel(ModelNode modelNode, BuildContext ctx)
    {
        if (ctx.HasAssemblyInfo(modelNode.Model.Id, out _)) return;

        // var modelInfo = await ctx.GetOrMakeViewModelInfo(modelNode);
        // foreach (var usedModel in modelInfo.Usages)
        // {
        //     if (usedModel.Model.ModelType == ModelType.Entity)
        //         await AnalyseUsedEntity(ctx, usedModel);
        //     else if (usedModel.Model.ModelType == ModelType.View)
        //         await AnalyseUsedView(ctx, usedModel);
        //     else
        //         throw new NotImplementedException();
        // }
    }

    #region ----Entity----

    private static async ValueTask AnalyseUsedEntity(BuildContext ctx, ModelNode entityModelNode)
    {
        //分析引用关系转换为示例的链表结构的列表
        //eg: A -> B -> C [-> A]    头尾循环
        //    A -> E -> F [-> E]    内部循环
        //    A -> X -> Y [-> A]    头尾循环，需要合并入之前的
        //    A -> X -> Z           无循环
        RecursiveBuildEntityLinks(ctx, entityModelNode);
        var allLinks = ctx.GetAndResetLinks();

        //处理各链接
        foreach (var links in allLinks)
        {
            await links.BuildEntityAssemblyInfos(ctx);
        }
    }

    private static void RecursiveBuildEntityLinks(BuildContext ctx, ModelNode entityModelNode)
    {
        //先判断是否存在循环引用
        if (ctx.CheckCircleLink(entityModelNode))
        {
            //将闭环的链加入列表
            ctx.AddCurrentLinks();
            return;
        }

        ctx.BeginBuildLink(entityModelNode);

        var usages = GetEntityUsages((EntityModel)entityModelNode.Model, ctx);
        if (usages.Count == 0)
        {
            //将开环的链加入列表
            ctx.AddCurrentLinks();
        }
        else
        {
            //继续递归
            foreach (var usage in usages)
            {
                RecursiveBuildEntityLinks(ctx, usage);
            }
        }

        ctx.EndBuildLink();
    }

    private static List<ModelNode> GetEntityUsages(EntityModel entityModel, BuildContext ctx)
    {
        var usages = new List<ModelNode>();

        var entityRefs = entityModel.Members
            .Where(m => m.Type == EntityMemberType.EntityRef)
            .Cast<EntityRefModel>();
        foreach (var entityRef in entityRefs)
        {
            foreach (var refModelId in entityRef.RefModelIds)
            {
                if (refModelId == entityModel.Id || usages.Any(n => n.Model.Id == refModelId)) continue;
                usages.Add(ctx.Hub.DesignTree.FindModelNode(refModelId)!);
            }
        }

        var entitySets = entityModel.Members
            .Where(m => m.Type == EntityMemberType.EntitySet)
            .Cast<EntitySetModel>();
        foreach (var entitySet in entitySets)
        {
            if (entitySet.RefModelId == entityModel.Id || usages.Any(n => n.Model.Id == entitySet.RefModelId)) continue;
            usages.Add(ctx.Hub.DesignTree.FindModelNode(entitySet.RefModelId)!);
        }

        return usages;
    }

    #endregion

    #region ----View----

    private static async ValueTask AnalyseUsedView(BuildContext ctx, ModelNode viewModelNode)
    {
        var viewModelInfo = await ctx.GetOrMakeViewModelInfo(viewModelNode);
        
    }
    
    

    #endregion

    // private static async Task<MetadataReference?> BuildEntitiesAssembly(DesignHub hub, string appName,
    //     IList<ModelNode> models, Dictionary<string, byte[]> appAssemblies)
    // {
    //     if (models.Count == 0) return null;
    //
    //     var srcPrjId = hub.TypeSystem.ModelProjectId;
    //     var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
    //
    //     var syntaxTrees = new List<SyntaxTree>();
    //
    //     foreach (var modelNode in models)
    //     {
    //         var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;
    //         var semanticModel = await srcDocument.GetSemanticModelAsync();
    //         syntaxTrees.Add(semanticModel!.SyntaxTree);
    //     }
    //
    //     var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
    //     var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
    //     syntaxTrees.Add(SyntaxFactory.ParseSyntaxTree(
    //         $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]")
    //     );
    //
    //     var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
    //         .WithNullableContextOptions(NullableContextOptions.Enable)
    //         .WithOptimizationLevel(OptimizationLevel.Release);
    //
    //     //开始编译运行时代码
    //     var compilation = CSharpCompilation.Create(null)
    //         .AddReferences(MetadataReferences.GetEntitiesAssemblyReferences())
    //         .AddSyntaxTrees(syntaxTrees)
    //         .WithOptions(options);
    //
    //     using var dllStream = new MemoryStream(1024);
    //     var emitResult = compilation.Emit(dllStream);
    //     CodeGeneratorUtil.CheckEmitResult(emitResult);
    //
    //     //先压缩
    //     dllStream.Position = 0;
    //     using var os = new MemoryStream(1024);
    //     await using var cs = new BrotliStream(os, CompressionMode.Compress, true);
    //     await dllStream.CopyToAsync(cs);
    //     await cs.FlushAsync();
    //     var asmData = os.ToArray();
    //     appAssemblies.Add($"{appName}.Entities", asmData);
    //
    //     //再创建MetadataReference
    //     dllStream.Position = 0;
    //     var entitiesMetadataReference = MetadataReference.CreateFromStream(dllStream);
    //     return entitiesMetadataReference;
    // }
    //
    // private static async Task BuildViewsAssembly(DesignHub hub, string appName, IList<ModelNode> models,
    //     Dictionary<string, byte[]> appAssemblies, MetadataReference? entitiesMetadataReference)
    // {
    //     if (models.Count == 0) return;
    //
    //     var srcPrjId = hub.TypeSystem.ViewsProjectId;
    //     var srcProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(srcPrjId);
    //
    //     var syntaxTrees = new List<SyntaxTree>();
    //
    //     foreach (var modelNode in models)
    //     {
    //         var srcDocument = srcProject!.GetDocument(modelNode.RoslynDocumentId!)!;
    //         var semanticModel = await srcDocument.GetSemanticModelAsync();
    //         var codegen = await ViewCsGenerator.Make(hub, modelNode);
    //         var newTree = await codegen.GetRuntimeSyntaxTree();
    //         syntaxTrees.Add(newTree);
    //     }
    //
    //     var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
    //     var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
    //     syntaxTrees.Add(SyntaxFactory.ParseSyntaxTree(
    //         CodeUtil.ViewGlobalUsings() +
    //         $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly:TargetFramework(\".NETStandard, Version = v2.1\")][assembly: AssemblyVersion(\"{asmVersion}\")]")
    //     );
    //
    //     var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
    //         .WithNullableContextOptions(NullableContextOptions.Enable)
    //         .WithOptimizationLevel(OptimizationLevel.Release);
    //
    //     //开始编译运行时代码
    //     var compilation = CSharpCompilation.Create(null)
    //         .AddReferences(MetadataReferences.GetViewsAssemblyReferences())
    //         .AddSyntaxTrees(syntaxTrees)
    //         .WithOptions(options);
    //     if (entitiesMetadataReference != null)
    //         compilation = compilation.AddReferences(entitiesMetadataReference);
    //
    //     using var dllStream = new MemoryStream(1024);
    //     await using var cs = new BrotliStream(dllStream, CompressionMode.Compress, true);
    //     var emitResult = compilation.Emit(cs);
    //     await cs.FlushAsync();
    //     CodeGeneratorUtil.CheckEmitResult(emitResult);
    //
    //     var asmData = dllStream.ToArray();
    //     appAssemblies.Add($"{appName}.Views", asmData);
    // }
}

internal sealed class BuildContext
{
    public BuildContext(DesignHub hub)
    {
        Hub = hub;
        ModelsProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(hub.TypeSystem.ModelProjectId)!;
        ViewsProject = hub.TypeSystem.Workspace.CurrentSolution.GetProject(hub.TypeSystem.ViewsProjectId)!;
    }

    internal readonly DesignHub Hub;
    internal readonly Project ViewsProject;
    internal readonly Project ModelsProject;

    private readonly Dictionary<ModelId, AssemblyInfo> _assemblyInfos = new();
    private readonly Dictionary<ModelId, ModelInfo> _viewModelCaches = new();

    #region ====ModelLinks====

    private List<ModelLinks>? _links;
    private readonly Stack<ModelLinks> _currentStack = new();

    public void BeginBuildLink(ModelNode modelNode)
    {
        if (_currentStack.Count == 0)
        {
            var newLinks = new ModelLinks { modelNode };
            _currentStack.Push(newLinks);
        }
        else
        {
            var newLinks = _currentStack.Peek()!.Clone();
            newLinks.Add(modelNode);
            _currentStack.Push(newLinks);
        }
    }

    public void EndBuildLink() => _currentStack.Pop();

    public bool CheckCircleLink(ModelNode modelNode)
    {
        var current = _currentStack.Peek()!;
        var index = current.IndexOf(modelNode);
        if (index < 0) return false;

        current.AddCircle(index);
        return true;
    }

    public void AddCurrentLinks()
    {
        _links ??= new List<ModelLinks>();
        _links.Add(_currentStack.Peek()!);
    }

    public List<ModelLinks> GetAndResetLinks()
    {
        var res = _links!;
        _links = null;
        return res;
    }

    #endregion

    internal void AddModelToAssembly(ModelId modelId, AssemblyInfo assemblyInfo) =>
        _assemblyInfos.Add(modelId, assemblyInfo);

    internal bool HasAssemblyInfo(ModelId modelId, out AssemblyInfo assemblyInfo) =>
        _assemblyInfos.TryGetValue(modelId, out assemblyInfo);

    internal async ValueTask<ModelInfo> GetOrMakeViewModelInfo(ModelNode viewModelNode)
    {
        if (_viewModelCaches.TryGetValue(viewModelNode.Model.Id, out var exists))
            return exists;
        
        var codegen = await ViewCsGenerator.Make(Hub, viewModelNode);
        var newTree = await codegen.GetRuntimeSyntaxTree();
        var usedModels = codegen.UsedModels.Select(fullName => Hub.DesignTree.FindModelNodeByFullName(fullName)!);
        var modelInfo = new ModelInfo(viewModelNode, newTree, usedModels.ToList());
        _viewModelCaches.Add(viewModelNode.Model.Id, modelInfo);
        return modelInfo;
    }

    internal async Task<ModelInfo> MakeEntityModelInfo(ModelNode entityModelNode)
    {
        var srcDocument = ModelsProject.GetDocument(entityModelNode.RoslynDocumentId!)!;
        var semanticModel = await srcDocument.GetSemanticModelAsync();
        return new ModelInfo(entityModelNode, semanticModel!.SyntaxTree);
    }
}

internal sealed class AssemblyInfo
{
    private readonly List<ModelInfo> _modelInfos = new();
    private readonly List<AssemblyInfo> _dependencies = new();

    public IList<ModelInfo> ModelInfos => _modelInfos;

    /// <summary>
    /// 添加模型并更新BuildContext的字典表
    /// </summary>
    public void AddModel(ModelInfo modelInfo, BuildContext ctx)
    {
        _modelInfos.Add(modelInfo);
        ctx.AddModelToAssembly(modelInfo.ModelId, this);
    }

    public bool Contains(ModelId modelId) => _modelInfos.Any(m => m.ModelId == modelId);

    public ModelInfo GetModelInfo(ModelId modelId) => _modelInfos.First(t => t.ModelId == modelId);

    public void AddDependency(AssemblyInfo used)
    {
        //TODO: 排除重复加入
        _dependencies.Add(used);
    }
}

internal sealed class ModelInfo
{
    /// <summary>
    /// For Entity
    /// </summary>
    public ModelInfo(ModelNode modelNode, SyntaxTree syntaxTree)
    {
        _modelNode = modelNode;
        _syntaxTree = syntaxTree;
        _usages = null;
    }

    /// <summary>
    /// For View
    /// </summary>
    public ModelInfo(ModelNode modelNode, SyntaxTree syntaxTree, IList<ModelNode> usages)
    {
        _modelNode = modelNode;
        _syntaxTree = syntaxTree;
        _usages = usages;
    }

    private readonly ModelNode _modelNode;
    private readonly SyntaxTree _syntaxTree;
    private readonly IList<ModelNode>? _usages;

    public ModelId ModelId => _modelNode.Model.Id;
    public IList<ModelNode> Usages => _usages!;
}

internal sealed class ModelLinks : List<ModelNode>
{
    private struct CircleRef
    {
        public int FromIndex;
        public int ToIndex;
    }

    //1. 可能存在多个循环引用
    //      ⌌----⌍    ⌌----⌍
    // A -> B -> C -> D -> E
    //2. 可能需要合并循环引用
    //      ⌌---------⌍
    // A -> B -> C -> D -> E
    //           ⌎---------⌏
    private List<CircleRef>? _circleRefs;

    public void AddCircle(int from)
    {
        var to = Count - 1;
        //检查现有的并尝试合并
        var hasMerged = false;
        if (_circleRefs != null)
        {
            for (var i = 0; i < _circleRefs.Count; i++)
            {
                if (from >= _circleRefs[i].ToIndex)
                {
                    //合并范围
                    _circleRefs[i] = new CircleRef
                        { FromIndex = Math.Min(from, _circleRefs[i].FromIndex), ToIndex = to };
                    //删除后续的，肯定被包含在合并后的范围内
                    if (i != _circleRefs.Count - 1)
                        _circleRefs.RemoveRange(i + 1, _circleRefs.Count - i - 1);

                    hasMerged = true;
                    break;
                }
            }
        }

        if (hasMerged) return;

        _circleRefs ??= new List<CircleRef>();
        _circleRefs.Add(new CircleRef { FromIndex = from, ToIndex = to });
    }

    public ModelLinks Clone()
    {
        var clone = new ModelLinks();
        clone.AddRange(this);
        if (_circleRefs != null)
        {
            clone._circleRefs = new List<CircleRef>();
            clone._circleRefs.AddRange(_circleRefs);
        }

        return clone;
    }

    public async ValueTask BuildEntityAssemblyInfos(BuildContext ctx)
    {
        if (_circleRefs == null || _circleRefs.Count == 0)
        {
            await BuildEntityOpenLinks(ctx, 0, Count - 1, null);
            return;
        }

        //以下包含循环引用分段处理
        AssemblyInfo? prev = null;
        var index = 0;
        for (var i = 0; i < _circleRefs.Count; i++)
        {
            var circle = _circleRefs[i];
            //判断前面有无空隙
            if (index < circle.FromIndex)
                prev = await BuildEntityOpenLinks(ctx, index, circle.FromIndex - 1, prev);
            //处理本身
            prev = await BuildEntityCloseLinks(ctx, circle, prev);
            index = circle.ToIndex + 1;
        }

        //最后判断后面有无空隙
        if (index < Count)
            await BuildEntityOpenLinks(ctx, index, Count - 1, prev);
    }

    private async Task<AssemblyInfo> BuildEntityOpenLinks(BuildContext ctx, int from, int to, AssemblyInfo? prev)
    {
        for (var i = from; i <= to; i++)
        {
            var modelNode = this[i];
            if (ctx.HasAssemblyInfo(modelNode.Model.Id, out var exists))
            {
                //这里不能中断循环,如下示例：
                //调用者已处理了 A -> B -> C
                //现在处理      A -> B -> D 中的B,那么需要继续处理D以合并B依赖的D

                prev?.AddDependency(exists);
                prev = exists;
                continue;
            }

            var modelInfo = await ctx.MakeEntityModelInfo(modelNode);
            var current = new AssemblyInfo();
            current.AddModel(modelInfo, ctx);

            prev?.AddDependency(current);
            prev = current;
        }

        return prev!;
    }

    private async Task<AssemblyInfo> BuildEntityCloseLinks(BuildContext ctx, CircleRef circle, AssemblyInfo? prev)
    {
        //先判断是否在之前已处理的循环引用内
        AssemblyInfo? assemblyInfo = null;
        for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
        {
            if (ctx.HasAssemblyInfo(this[i].Model.Id, out var exists))
            {
                assemblyInfo = exists;
                break;
            }
        }

        if (assemblyInfo != null)
        {
            //合并入之前的循环引用内
            for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
            {
                if (!assemblyInfo.Contains(this[i].Model.Id))
                    assemblyInfo.AddModel(await ctx.MakeEntityModelInfo(this[i]), ctx);
            }
        }
        else
        {
            assemblyInfo = new AssemblyInfo();
            for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
            {
                assemblyInfo.AddModel(await ctx.MakeEntityModelInfo(this[i]), ctx);
            }
        }

        prev?.AddDependency(assemblyInfo);
        return assemblyInfo!;
    }
}