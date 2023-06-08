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

        //先转换各视图模型的运行时代码，并且取得引用关系
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

    private static async Task BuildViewModel(ModelNode modelNode, BuildContext ctx)
    {
        if (ctx.HasModelInfo(modelNode.Model.Id)) return;

        var codegen = await ViewCsGenerator.Make(ctx.Hub, modelNode);
        var newTree = await codegen.GetRuntimeSyntaxTree();
        var modelInfo = new ModelInfo(modelNode, newTree);
        ctx.AddModelInfo(modelInfo);

        //开始分析引用关系
        var usedModels = codegen.UsedModels.Select(fullName => ctx.Hub.DesignTree.FindModelNodeByFullName(fullName)!);
        foreach (var usedModel in usedModels)
        {
            if (usedModel.Model.ModelType == ModelType.Entity)
                await AnalyseUsedEntity(ctx, usedModel, modelInfo);
            else if (usedModel.Model.ModelType == ModelType.View)
                throw new NotImplementedException(); //AnalyseUsedView(ctx, usedModel);
            else
                throw new NotImplementedException();
        }
    }

    private static async ValueTask AnalyseUsedEntity(BuildContext ctx, ModelNode entityModelNode,
        ModelInfo viewModelInfo)
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
            await links.BuildEntityAssemblyInfos(ctx, viewModelInfo);
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
    private readonly List<AssemblyInfo> _assemblyInfos = new();
    private readonly Dictionary<ModelId, AssemblyInfo> _assemblyInfosMap = new();
    private readonly Dictionary<ModelId, ModelInfo> _modelInfosMap = new();

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

    internal void AddModelInfo(ModelInfo modelInfo) => _modelInfosMap.Add(modelInfo.ModelId, modelInfo);

    internal bool HasModelInfo(ModelId modelId) => _modelInfosMap.ContainsKey(modelId);

    internal void AddAssemblyInfo(AssemblyInfo assemblyInfo)
    {
        _assemblyInfos.Add(assemblyInfo);
        foreach (var modelInfo in assemblyInfo.ModelInfos)
        {
            _assemblyInfosMap.Add(modelInfo.ModelId, assemblyInfo);
        }
    }

    internal bool HasAssemblyInfo(ModelId modelId, out AssemblyInfo assemblyInfo) =>
        _assemblyInfosMap.TryGetValue(modelId, out assemblyInfo);

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

    public IList<ModelInfo> ModelInfos => _modelInfos;

    public void AddModel(ModelInfo modelInfo) => _modelInfos.Add(modelInfo);

    public bool Contains(ModelId modelId) => _modelInfos.Any(m => m.ModelId == modelId);

    public ModelInfo GetModelInfo(ModelId modelId) => _modelInfos.First(t => t.ModelId == modelId);
}

internal sealed class ModelInfo
{
    public ModelInfo(ModelNode modelNode, SyntaxTree syntaxTree)
    {
        _modelNode = modelNode;
        _syntaxTree = syntaxTree;
    }

    private readonly ModelNode _modelNode;
    private readonly SyntaxTree _syntaxTree;
    private readonly List<AssemblyInfo> _assemblies = new(); //视图模型第一项为本身

    public ModelId ModelId => _modelNode.Model.Id;

    public void AddAssembly(AssemblyInfo assemblyInfo) => _assemblies.Add(assemblyInfo);
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

    public async ValueTask BuildEntityAssemblyInfos(BuildContext ctx, ModelInfo viewModelInfo)
    {
        if (_circleRefs == null || _circleRefs.Count == 0)
        {
            await BuildEntityOpenLinks(ctx, viewModelInfo, 0, Count - 1);
        }
        else
        {
            AssemblyInfo? prev = null;
            for (var i = Count - 1; i >= 0;)
            {

                i--;
            }
        }
    }

    private async Task<AssemblyInfo> BuildEntityOpenLinks(BuildContext ctx, ModelInfo viewModelInfo, int from, int to)
    {
        AssemblyInfo? prev = null;
        for (var i = to; i >= from; i--)
        {
            var modelNode = this[i];
            if (ctx.HasAssemblyInfo(modelNode.Model.Id, out var exists))
            {
                //调用者已处理了 A -> B -> C
                //现在处理      A -> B -> D 中的B,那么需要合并B依赖的D
                if (prev != null)
                    exists.GetModelInfo(modelNode.Model.Id).AddAssembly(exists);
                    
                prev = exists;
                continue;
            }

            var modelInfo = await ctx.MakeEntityModelInfo(modelNode);
            ctx.AddModelInfo(modelInfo);
            var assemblyInfo = new AssemblyInfo();
            assemblyInfo.AddModel(modelInfo);
            ctx.AddAssemblyInfo(assemblyInfo);
            viewModelInfo.AddAssembly(assemblyInfo);
            if (i != to)
                modelInfo.AddAssembly(prev!);
            prev = assemblyInfo;
        }

        return prev!;
    }

    private async Task<AssemblyInfo> BuildEntityCloseLinks(BuildContext ctx, ModelInfo viewModelInfo, CircleRef circle)
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
            for (var i = circle.FromIndex; i <= circle.ToIndex; i++)
            {
                if (!assemblyInfo.Contains(this[i].Model.Id))
                    assemblyInfo.AddModel(await ctx.MakeEntityModelInfo(this[i]));
            }
        }
        else
        {
            
        }

        return assemblyInfo!;
    }
}