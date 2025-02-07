using System.Diagnostics;
using System.IO.Compression;
using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace AppBoxDesign;

/// <summary>
/// 生成客户端应用的程序集
/// </summary>
internal static class BuildApp
{
    internal static async Task Execute()
    {
        //TODO:*****目前简单实现，待实现从HomePage的路由表开始分析引用关系，仅生成用到的模型的程序集
        //TODO:检查签出情况，如有其他签出返回警告

        var hub = DesignHub.Current;
        var ctx = new BuildContext(hub);
        var viewAssemblyMap = new Dictionary<ModelNode, List<AssemblyInfo>>();

        for (var i = 0; i < hub.DesignTree.AppRootNode.Children.Count; i++)
        {
            var appNode = hub.DesignTree.AppRootNode.Children[i];
            var viewRootNode = appNode.FindModelRootNode(ModelType.View);
            var viewModels = viewRootNode.GetAllModelNodes()
                .Where(n => ((ViewModel)n.Model).ViewType == ViewModelType.PixUI) //仅代码视图模型
                .ToArray();
            foreach (var viewModelNode in viewModels)
            {
                await AnalyseView(ctx, viewModelNode);
            }

            //附加视图程序集依赖的实体程序集
            foreach (var viewModelNode in viewModels)
            {
                await AddUsedEntitiesToViewAssembly(ctx, viewModelNode);
            }

            //构建视图模型所依赖的所有程序集(直接及间接的)，用于前端LazyLoad
            foreach (var viewModelNode in viewModels)
            {
                BuildViewAssemblyMap(ctx, viewAssemblyMap, viewModelNode);
            }
        }

        //编译所有程序集
        var allAssemblies = ctx.GetAllAssemblies();
        foreach (var assemblyInfo in allAssemblies)
        {
            assemblyInfo.TryCompile();
        }

        // TODO: 以下递交至服务端执行
        // //压缩保存
        // await using var txn = await SqlStore.Default.BeginTransactionAsync();
        // //先清除旧的
        // await MetaStore.Provider.DeleteAllAppAssembliesAsync(txn);
        // //保存程序集
        // foreach (var assemblyInfo in allAssemblies)
        // {
        //     await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ClientApp, assemblyInfo.AssemblyName,
        //         assemblyInfo.CompressAssemblyData(), txn);
        // }
        //
        // //保存视图模型对应的所有程序集的映射
        // foreach (var kv in viewAssemblyMap)
        // {
        //     var viewModelName = $"{kv.Key.AppNode.Model.Name}.{kv.Key.Model.Name}";
        //     //暂用json编码
        //     var jsonData = JsonSerializer.SerializeToUtf8Bytes(kv.Value.Select(v => v.AssemblyName));
        //     var asmFlag = ctx.GetModelInfo(kv.Key).IsDynamicWidget
        //         ? AssemblyFlag.ViewDynamic
        //         : AssemblyFlag.None;
        //     await MetaStore.Provider.UpsertAssemblyAsync(MetaAssemblyType.ViewAssemblies, viewModelName, jsonData, txn,
        //         asmFlag);
        // }
        //
        // await txn.CommitAsync();
    }
    
    private static async ValueTask AnalyseView(BuildContext ctx, ModelNode viewModelNode)
    {
        if (ctx.HasAssemblyInfo(viewModelNode.Model.Id, out _)) return;

        var viewModelInfo = await ctx.GetOrMakeModelInfo(viewModelNode);
        var linksContext = new LinksContext();
        await RecursiveBuildViewLinks(ctx, linksContext, viewModelInfo);
        var allLinks = linksContext.GetAndResetLinks();
        foreach (var links in allLinks)
        {
            links.BuildAssemblyInfos(ctx);
        }
    }

    private static async ValueTask RecursiveBuildViewLinks(BuildContext ctx, LinksContext links,
        ModelInfo viewModelInfo)
    {
        //先判断是否存在循环引用
        if (links.CheckCircleLink(viewModelInfo))
        {
            //将闭环的链加入列表
            links.AddCurrentLinks();
            return;
        }

        links.BeginBuildLink(viewModelInfo);

        var usedViews = viewModelInfo.Usages.Where(n => n.Model.ModelType == ModelType.View).ToArray();
        if (usedViews.Length == 0)
        {
            //将开环的链加入列表
            links.AddCurrentLinks();
        }
        else
        {
            //继续递归
            foreach (var usage in usedViews)
            {
                await RecursiveBuildViewLinks(ctx, links, await ctx.GetOrMakeModelInfo(usage));
            }
        }

        links.EndBuildLink();

        //处理当前视图引用的实体
        var usedEntities = viewModelInfo.Usages.Where(n => n.Model.ModelType == ModelType.Entity);
        foreach (var usedentity in usedEntities)
        {
            await AnalyseEntity(ctx, usedentity);
        }
    }

    private static async ValueTask AnalyseEntity(BuildContext ctx, ModelNode entityModelNode)
    {
        //分析引用关系转换为示例的链表结构的列表
        //eg: A -> B -> C [-> A]    头尾循环
        //    A -> E -> F [-> E]    内部循环
        //    A -> X -> Y [-> A]    头尾循环，需要合并入之前的
        //    A -> X -> Z           无循环

        if (ctx.HasAssemblyInfo(entityModelNode.Model.Id, out _)) return;

        var entityModelInfo = await ctx.GetOrMakeModelInfo(entityModelNode);
        var linksContext = new LinksContext();
        await RecursiveBuildEntityLinks(ctx, linksContext, entityModelInfo);
        var allLinks = linksContext.GetAndResetLinks();
        foreach (var links in allLinks)
        {
            links.BuildAssemblyInfos(ctx);
        }
    }

    private static async ValueTask RecursiveBuildEntityLinks(BuildContext ctx, LinksContext links,
        ModelInfo entityModelInfo)
    {
        //先判断是否存在循环引用
        if (links.CheckCircleLink(entityModelInfo))
        {
            //将闭环的链加入列表
            links.AddCurrentLinks();
            return;
        }

        links.BeginBuildLink(entityModelInfo);

        var usages = entityModelInfo.Usages;
        if (usages.Count == 0)
        {
            //将开环的链加入列表
            links.AddCurrentLinks();
        }
        else
        {
            //继续递归
            foreach (var usage in usages)
            {
                await RecursiveBuildEntityLinks(ctx, links, await ctx.GetOrMakeModelInfo(usage));
            }
        }

        links.EndBuildLink();
    }

    private static async ValueTask AddUsedEntitiesToViewAssembly(BuildContext ctx, ModelNode viewModelNode)
    {
        var exists = ctx.HasAssemblyInfo(viewModelNode.Model.Id, out var viewAssemblyInfo);
        Debug.Assert(exists);

        var viewModelInfo = await ctx.GetOrMakeModelInfo(viewModelNode);
        var usedEntities = viewModelInfo.Usages.Where(n => n.Model.ModelType == ModelType.Entity);
        foreach (var usedEntity in usedEntities)
        {
            exists = ctx.HasAssemblyInfo(usedEntity.Model.Id, out var entityAssemblyInfo);
            Debug.Assert(exists);

            viewAssemblyInfo.TryAddDependency(entityAssemblyInfo);
        }
    }

    private static void BuildViewAssemblyMap(BuildContext ctx, Dictionary<ModelNode, List<AssemblyInfo>> map,
        ModelNode viewModelNode)
    {
        var exists = ctx.HasAssemblyInfo(viewModelNode.Model.Id, out var viewAssemblyInfo);
        Debug.Assert(exists);

        var all = new List<AssemblyInfo>();
        RecursiveBuildViewAssembies(viewAssemblyInfo, all);
        map.Add(viewModelNode, all);
    }

    private static void RecursiveBuildViewAssembies(AssemblyInfo assemblyInfo, List<AssemblyInfo> all)
    {
        var exists = all.Exists(a => a.Id == assemblyInfo.Id);
        if (!exists)
            all.Add(assemblyInfo);

        foreach (var dependency in assemblyInfo.Dependencies)
        {
            RecursiveBuildViewAssembies(dependency, all);
        }
    }
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
    private readonly Dictionary<ModelId, ModelInfo> _modelCache = new();

    private int _assemblyid = 0;

    internal int MakeAssemblyId() => Interlocked.Increment(ref _assemblyid);

    internal void AddModelToAssembly(ModelId modelId, AssemblyInfo assemblyInfo) =>
        _assemblyInfos.Add(modelId, assemblyInfo);

    internal bool HasAssemblyInfo(ModelId modelId, out AssemblyInfo assemblyInfo) =>
        _assemblyInfos.TryGetValue(modelId, out assemblyInfo);

    internal async ValueTask<ModelInfo> GetOrMakeModelInfo(ModelNode modelNode)
    {
        if (_modelCache.TryGetValue(modelNode.Model.Id, out var exists))
            return exists;

        if (modelNode.Model.ModelType == ModelType.Entity)
        {
            var srcDocument = ModelsProject.GetDocument(modelNode.RoslynDocumentId!)!;
            var semanticModel = await srcDocument.GetSemanticModelAsync();
            var usedModels = GetEntityUsages((EntityModel)modelNode.Model);
            var modelInfo = new ModelInfo(modelNode, semanticModel!.SyntaxTree, usedModels);
            _modelCache.Add(modelInfo.ModelId, modelInfo);
            return modelInfo;
        }

        if (modelNode.Model.ModelType == ModelType.View)
        {
            var codegen = await ViewCsGenerator.Make(Hub, modelNode, false);
            var newTree = await codegen.GetRuntimeSyntaxTree();
            var usedModels = codegen.UsedModels.Select(fullName => Hub.DesignTree.FindModelNodeByFullName(fullName)!);
            var modelInfo = new ModelInfo(modelNode, newTree, usedModels.ToList(), codegen.IsDynamicWidget);
            _modelCache.Add(modelInfo.ModelId, modelInfo);
            return modelInfo;
        }

        throw new NotImplementedException();
    }

    internal ModelInfo GetModelInfo(ModelNode modelNode) => _modelCache[modelNode.Model.Id];

    private List<ModelNode> GetEntityUsages(EntityModel entityModel)
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
                usages.Add(Hub.DesignTree.FindModelNode(refModelId)!);
            }
        }

        var entitySets = entityModel.Members
            .Where(m => m.Type == EntityMemberType.EntitySet)
            .Cast<EntitySetModel>();
        foreach (var entitySet in entitySets)
        {
            if (entitySet.RefModelId == entityModel.Id || usages.Any(n => n.Model.Id == entitySet.RefModelId)) continue;
            usages.Add(Hub.DesignTree.FindModelNode(entitySet.RefModelId)!);
        }

        return usages;
    }

    public IList<AssemblyInfo> GetAllAssemblies() => _assemblyInfos.Values.Distinct().ToArray();
}

internal sealed class LinksContext
{
    private List<ModelLinks>? _links;
    private readonly Stack<ModelLinks> _currentStack = new();

    public void BeginBuildLink(ModelInfo modelInfo)
    {
        if (_currentStack.Count == 0)
        {
            var newLinks = new ModelLinks { modelInfo };
            _currentStack.Push(newLinks);
        }
        else
        {
            var newLinks = _currentStack.Peek()!.Clone();
            newLinks.Add(modelInfo);
            _currentStack.Push(newLinks);
        }
    }

    public void EndBuildLink() => _currentStack.Pop();

    public bool CheckCircleLink(ModelInfo modelInfo)
    {
        if (!_currentStack.TryPeek(out var current))
            return false;

        var index = current.IndexOf(modelInfo);
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
}

internal sealed class AssemblyInfo : IEqualityComparer<AssemblyInfo>
{
    public AssemblyInfo(int id)
    {
        Id = id;
    }

    private readonly List<ModelInfo> _modelInfos = new();
    private byte[]? _asmData;
    public int Id { get; }
    public List<AssemblyInfo> Dependencies { get; } = new();
    public string AssemblyName => Id.ToString("X");

    /// <summary>
    /// 添加模型并更新BuildContext的字典表
    /// </summary>
    public void AddModel(ModelInfo modelInfo, BuildContext ctx)
    {
        _modelInfos.Add(modelInfo);
        ctx.AddModelToAssembly(modelInfo.ModelId, this);
    }

    public bool Contains(ModelId modelId) => _modelInfos.Any(m => m.ModelId == modelId);

    public void TryAddDependency(AssemblyInfo used)
    {
        if (!Dependencies.Exists(a => a.Id == used.Id))
            Dependencies.Add(used);
    }

    public void TryCompile()
    {
        if (_asmData != null) return;

        //TODO:暂只支持View及Entity
        var isViewAssembly = _modelInfos[0].ModelId.Type == ModelType.View;

        var syntaxTrees = _modelInfos.Select(modelInfo => modelInfo.SyntaxTree).ToList();
        var version = (int)(DateTime.Now - DateTime.UnixEpoch).TotalSeconds;
        var asmVersion = $"{version >> 24}.{(version >> 16) & 0xFF}.{version & 0xFFFF}";
        syntaxTrees.Add(SyntaxFactory.ParseSyntaxTree(
            isViewAssembly
                ? CodeUtil.ViewGlobalUsings()
                : "" +
                  $"using System.Reflection;using System.Runtime.CompilerServices;using System.Runtime.Versioning;[assembly: AssemblyVersion(\"{asmVersion}\")]",
            TypeSystem.ParseOptions)
        );

        var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, false)
            .WithNullableContextOptions(NullableContextOptions.Enable)
            .WithOptimizationLevel(OptimizationLevel.Release);

        //开始编译运行时代码
        var compilation = CSharpCompilation.Create(AssemblyName)
            .AddReferences(isViewAssembly
                ? MetadataReferences.GetViewsAssemblyReferences()
                : MetadataReferences.GetEntitiesAssemblyReferences())
            .AddSyntaxTrees(syntaxTrees)
            .WithOptions(options);

        //附加依赖的模型程序集
        foreach (var dependency in Dependencies)
        {
            compilation = compilation.AddReferences(dependency.GetMetadataReference());
        }

        using var dllStream = new MemoryStream(1024);
        var emitResult = compilation.Emit(dllStream);
        CodeGeneratorUtil.CheckEmitResult(emitResult);

        _asmData = dllStream.ToArray();
    }

    public MetadataReference GetMetadataReference()
    {
        if (_asmData == null)
            TryCompile();

        return MetadataReference.CreateFromStream(new MemoryStream(_asmData!));
    }

    public byte[] CompressAssemblyData()
    {
        using var output = new MemoryStream(1024);
        using var zipStream = new DeflateStream(output, CompressionMode.Compress); //Blazor暂不支持Brotli
        zipStream.Write(_asmData!);
        zipStream.Flush();
        return output.ToArray();
    }

    public bool Equals(AssemblyInfo x, AssemblyInfo y) => x.Id == y.Id;

    public int GetHashCode(AssemblyInfo obj) => Id;
}

internal sealed class ModelInfo
{
    public ModelInfo(ModelNode modelNode, SyntaxTree syntaxTree, IList<ModelNode> usages, bool isDynamicWidget = false)
    {
        ModelNode = modelNode;
        SyntaxTree = syntaxTree;
        Usages = usages;
        IsDynamicWidget = isDynamicWidget;
    }

    internal readonly ModelNode ModelNode;

    /// <summary>
    /// 是否标记了DynamicWidgetAttribute的视图模型
    /// </summary>
    internal readonly bool IsDynamicWidget;

    public ModelId ModelId => ModelNode.Model.Id;
    public IList<ModelNode> Usages { get; }
    public SyntaxTree SyntaxTree { get; }
}

internal sealed class ModelLinks : List<ModelInfo>
{
    private readonly struct CircleRef
    {
        public CircleRef(int from, int to)
        {
            FromIndex = from;
            ToIndex = to;
        }

        public readonly int FromIndex;
        public readonly int ToIndex;
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
                    _circleRefs[i] = new CircleRef(Math.Min(from, _circleRefs[i].FromIndex), to);
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
        _circleRefs.Add(new CircleRef(from, to));
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

    public void BuildAssemblyInfos(BuildContext ctx)
    {
        if (_circleRefs == null || _circleRefs.Count == 0)
        {
            BuildOpenLinks(ctx, 0, Count - 1, null);
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
                prev = BuildOpenLinks(ctx, index, circle.FromIndex - 1, prev);
            //处理本身
            prev = BuildCloseLinks(ctx, circle, prev);
            index = circle.ToIndex + 1;
        }

        //最后判断后面有无空隙
        if (index < Count)
            BuildOpenLinks(ctx, index, Count - 1, prev);
    }

    private AssemblyInfo BuildOpenLinks(BuildContext ctx, int from, int to, AssemblyInfo? prev)
    {
        for (var i = from; i <= to; i++)
        {
            var modelInfo = this[i];
            if (ctx.HasAssemblyInfo(modelInfo.ModelId, out var exists))
            {
                //这里不能中断循环,如下示例：
                //调用者已处理了 A -> B -> C
                //现在处理      A -> B -> D 中的B,那么需要继续处理D以合并B依赖的D

                prev?.TryAddDependency(exists);
                prev = exists;
                continue;
            }

            var current = new AssemblyInfo(ctx.MakeAssemblyId());
            current.AddModel(modelInfo, ctx);

            prev?.TryAddDependency(current);
            prev = current;
        }

        return prev!;
    }

    private AssemblyInfo BuildCloseLinks(BuildContext ctx, CircleRef circle, AssemblyInfo? prev)
    {
        //先判断是否在之前已处理的循环引用内
        AssemblyInfo? assemblyInfo = null;
        for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
        {
            if (ctx.HasAssemblyInfo(this[i].ModelId, out var exists))
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
                if (!assemblyInfo.Contains(this[i].ModelId))
                    assemblyInfo.AddModel(this[i], ctx);
            }
        }
        else
        {
            assemblyInfo = new AssemblyInfo(ctx.MakeAssemblyId());
            for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
            {
                assemblyInfo.AddModel(this[i], ctx);
            }
        }

        prev?.TryAddDependency(assemblyInfo);
        return assemblyInfo!;
    }
}