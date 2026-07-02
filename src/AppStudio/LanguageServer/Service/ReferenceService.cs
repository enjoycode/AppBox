using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.FindSymbols;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 查询模型间的依赖关系
/// </summary>
internal static class ReferenceService
{
    /// <summary>
    /// 查找模型的引用项
    /// </summary>
    internal static Task<List<Reference>> FindModelReferencesAsync(DesignContext ctx, ModelNode modelNode)
    {
        //TODO: 未实现的
        return modelNode.Model.ModelType switch
        {
            ModelType.Entity => FindEntityReferences(ctx, modelNode),
            ModelType.Service => FindServiceReferences(ctx, modelNode),
            ModelType.Enum => FindEnumReferences(ctx, modelNode),
            ModelType.View => FindViewReferences(ctx, modelNode),
            ModelType.Permission => Task.FromResult<List<Reference>>([]),
            ModelType.Report => Task.FromResult<List<Reference>>([]),
            ModelType.Workflow => Task.FromResult<List<Reference>>([]),
            _ => throw new NotImplementedException($"查找模型引用: {modelNode.Model.ModelType}")
        };
    }

    private static async Task<List<Reference>> FindEntityReferences(DesignContext ctx, ModelNode modelNode)
    {
        var ls = new List<Reference>();

        var entityModelId = modelNode.Model.Id;
        var modelClass = await ctx.GetModelSymbolAsync(modelNode);
        await AddCodeReferencesAsync(ctx, ls, modelClass!);

        //移除自身的代码引用
        ls.RemoveAll(r => r.ModelNode == modelNode);
        //修改其他实体的引用
        var entityNodes = ls.Where(r => r.ModelNode.ModelType == ModelType.Entity)
            .Select(r => r.ModelNode)
            .Distinct()
            .ToList();
        ls.RemoveAll(r => r.ModelNode.ModelType == ModelType.Entity);
        foreach (var entityNode in entityNodes)
            AddReferencesFromEntityModel(ls, entityNode,
                ModelReferenceType.EntityModel, entityModelId, null, null);

        return ls;
    }

    /// <summary>
    /// 查找实体模型成员的引用项
    /// </summary>
    internal static async Task<List<Reference>> FindEntityMemberReferencesAsync(DesignContext context,
        ModelNode modelNode, EntityMember member)
    {
        var appName = modelNode.AppNode.Model.Name;
        var modelName = modelNode.Model.Name;
        var memberName = member.Name;

        var ls = new List<Reference>();

        //查找实体模型本身及所有其他实体模型的相关表达式（组织策略、编辑策略等）的引用
        AddReferencesFromEntityModels(context, ls, ModelReferenceType.EntityMember, modelNode.Model.Id,
            memberName, member.MemberId);

        //获取虚拟代码的成员符号并查找代码引用
        var symbol = await context.GetEntityMemberSymbolAsync(modelNode, memberName);
        if (symbol != null)
            await AddCodeReferencesAsync(context, ls, symbol);
        else
            Log.Warn($"Can't get EntityMember symbol: {appName}.{modelName}.{memberName}");

        return ls;
    }

    // /// <summary>
    // /// 查找实体模型的索引的引用项
    // /// </summary>
    // private static Task<List<Reference>> FindEntityIndexReferencesAsync(DesignHub hub,
    //     string appName, string modelName, string indexName)
    // {
    //     throw new NotImplementedException();
    //     // var ls = new List<Reference>();
    //     // //获取索引虚拟成员
    //     // var symbol = await hub.TypeSystem.GetEntityIndexSymbolAsync(appName, modelName, indexName);
    //     // if (symbol != null)
    //     //     await AddCodeReferencesAsync(hub, ls, symbol, null);
    //     // else
    //     //     Log.Warn($"Can't get EntityIndex symbol: {appName}.{modelName}.{indexName}");
    //     // return ls;
    // }

    private static async Task<List<Reference>> FindServiceReferences(DesignContext ctx, ModelNode modelNode)
    {
        var ls = new List<Reference>();

        //查找其他服务引用
        var modelClass = await ctx.GetModelSymbolAsync(modelNode);
        await AddCodeReferencesAsync(ctx, ls, modelClass!);
        //TODO:查找视图引用
        return ls;
    }

    private static async Task<List<Reference>> FindViewReferences(DesignContext context, ModelNode modelNode)
    {
        var ls = new List<Reference>();

        var modelSymbol = await context.GetModelSymbolAsync(modelNode);
        await AddCodeReferencesAsync(context, ls, modelSymbol!);
        return ls;
    }

    private static async Task<List<Reference>> FindEnumReferences(DesignContext context, ModelNode modelNode)
    {
        var ls = new List<Reference>();

        var enumModelId = modelNode.Model.Id;
        var modelSymbol = await context.GetModelSymbolAsync(modelNode);
        await AddCodeReferencesAsync(context, ls, modelSymbol!);

        //修改实体枚举成员的引用
        var entityNodes = ls.Where(r => r.ModelNode.ModelType == ModelType.Entity)
            .Select(r => r.ModelNode)
            .Distinct()
            .ToList();
        ls.RemoveAll(r => r.ModelNode.ModelType == ModelType.Entity);
        foreach (var entityNode in entityNodes)
            AddReferencesFromEntityModel(ls, entityNode, ModelReferenceType.EnumModel, enumModelId, null, null);

        return ls;
    }

    internal static async Task<List<Reference>> FindEnumItemReferencesAsync(DesignContext context,
        ModelNode modelNode, string itemName)
    {
        var ls = new List<Reference>();

        //TODO: 如果实体的枚举成员指定了默认值需要处理
        //AddReferencesFromEntityModels(hub, ls, ModelReferenceType.EntityMemberName, modelID, memberName);

        //获取虚拟成员及相应的资源的虚拟成员
        var symbol = await context.GetEnumItemSymbolAsync(modelNode, itemName);
        //加入所有的代码引用
        if (symbol != null)
            await AddCodeReferencesAsync(context, ls, symbol);
        else
            Log.Warn($"Can't get EnumItem symbol: {modelNode.AppName}.{modelNode.Model.Name}.{itemName}");

        return ls;
    }

    /// <summary>
    /// 从所有实体模型中查找指定类型的引用项
    /// </summary>
    private static void AddReferencesFromEntityModels(DesignContext context, List<Reference> list,
        ModelReferenceType referenceType, ModelId modelId, string? memberName, short? entityMemberId)
    {
        var allEntityNodes = context.DesignTree.FindNodesByType(ModelType.Entity);
        foreach (var entityNode in allEntityNodes)
        {
            AddReferencesFromEntityModel(list, entityNode, referenceType, modelId, memberName, entityMemberId);
        }
    }

    private static void AddReferencesFromEntityModel(List<Reference> list, ModelNode entityNode,
        ModelReferenceType referenceType, ModelId modelId, string? memberName, short? entityMemberId)
    {
        var model = (EntityModel)entityNode.Model;
        var mrs = new List<ModelReferenceInfo>();
        model.AddModelReferences(mrs, referenceType, modelId, memberName, entityMemberId);
        foreach (var item in mrs)
        {
            list.Add(new ModelReference(entityNode, item));
        }
    }

    /// <summary>
    /// 添加代码引用
    /// </summary>
    internal static async Task AddCodeReferencesAsync(DesignContext context, List<Reference> list, ISymbol symbol)
    {
        var solution = context.Workspace.CurrentSolution;
        var referencedSymbols = await SymbolFinder.FindReferencesAsync(symbol, solution);
        foreach (var item in referencedSymbols)
        {
            foreach (var loc in item.Locations)
            {
                var modelId = DocNameUtil.GetModelIdFromDocName(loc.Document.Name);
                var modelNode = context.DesignTree.FindModelNode(modelId)!;
                var sourceSpan = loc.Location.SourceSpan;
                var reference = new CodeReference(modelNode, sourceSpan.Start, sourceSpan.Length);
                list.Add(reference);
            }
        }
    }
}