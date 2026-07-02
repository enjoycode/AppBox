using AppBoxCore;

namespace AppBoxDesign;

internal static class RenameService
{
    /// <summary>
    /// 开始执行重命名
    /// </summary>
    internal static async Task<IList<Reference>> RenameAsync(DesignContext context,
        ModelReferenceType referenceType, ModelId modelId, string oldName, string newName)
    {
        //注意：暂不用Roslyn的Renamer.RenameSymbolAsync，因为需要处理多个Symbol

        ModelNode sourceNode;
        List<Reference> references;
        //1.查找引用项并排序，同时判断有无签出
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                sourceNode = context.DesignTree.FindModelNode(modelId)!;
                var entityModel = (EntityModel)sourceNode.Model;
                var entityMember = entityModel.GetMember(oldName)!;
                references = await ReferenceService.FindEntityMemberReferencesAsync(context, sourceNode, entityMember);
                break;
            case ModelReferenceType.EntityModel:
            case ModelReferenceType.ServiceModel:
            case ModelReferenceType.ViewModel:
                sourceNode = context.DesignTree.FindModelNode(modelId)!;
                references = await ReferenceService.FindModelReferencesAsync(context, sourceNode);
                break;
            default:
                throw new NotImplementedException($"重命名引用类型: {referenceType}");
        }

        if (!sourceNode.IsCheckoutByMe)
            throw new Exception("当前模型尚未签出");
        references.Sort();
        for (var i = 0; i < references.Count; i++)
        {
            if (!await references[i].ModelNode.CheckoutAsync())
                throw new Exception($"模型[{references[i].ModelNode.Model.Name}]无法签出");
        }

        ////3.添加特殊引用项（如模型资源名称）
        //if (addSpecRefsAction != null)
        //    addSpecRefsAction(references);

        //4.开始重命名, TODO:考虑启用事务保存
        var diff = 0; //新旧成员名称间字符数之差的累积
        for (var i = 0; i < references.Count; i++)
        {
            Reference r = references[i];
            if (i > 0 && r.ModelNode.Model.Id == references[i - 1].ModelNode.Model.Id) //表示还在同一模型内
            {
                diff += newName.Length - oldName.Length;
            }
            else //开始Rename新的模型
            {
                //完结之前节点的重命名
                if (i > 0)
                    await FinishRenamedNode(references[i - 1].ModelNode);
                diff = 0;
            }

            //判断引用类型，分别处理
            switch (r)
            {
                case CodeReference cr:
                    cr.Rename(context, diff, newName);
                    break;
                case ModelReference mr:
                    mr.TargetReference.Target.RenameReference(referenceType,
                        mr.TargetReference.TargetType, modelId, oldName, newName);
                    break;
                default:
                    throw new Exception($"Unknown Reference Type: {r.GetType().Name}");
            }

            if (i == references.Count - 1)
                await FinishRenamedNode(references[i].ModelNode);
        } //end for references

        //6.根据源类型进行相关的模型处理并保存，另根据源引用类型更新相应的RoslynDocument
        bool needUpdateSourceRoslyn; //注意:如果改为RoslynRenamer实现则不再需要更新
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                ((EntityModel)sourceNode.Model).RenameMember(oldName, newName);
                needUpdateSourceRoslyn = true;
                break;
            case ModelReferenceType.EntityModel:
                ((EntityModel)sourceNode.Model).RenameTo(newName);
                needUpdateSourceRoslyn = true;
                break;
            default:
                throw new NotImplementedException();
        }

        await sourceNode.SaveAsync(null);
        if (needUpdateSourceRoslyn)
            await context.UpdateModelDocumentAsync(sourceNode);

        //最后返回处理结果，暂简单返回受影响的节点，由前端刷新
        return references;
    }

    /// <summary>
    /// RenameReferences的辅助方法，用于完结模型结点的重命名，并保存模型
    /// </summary>
    private static async Task FinishRenamedNode(ModelNode node)
    {
        //保存节点
        await node.SaveAsync(null);
        //TODO: 是否需要更新引用者的RoslynDocument
    }

    #region ----尝试使用Roslyn.Renamer----

    // private static void RenameEntityMember(DesignHub hub, ModelReferenceType referenceType,
    //     string modelID, string oldName, string newName)
    // {
    //     //1.先判断名称合法性

    //     //2.先尝试签出当前节点
    //     var sourceNode = hub.DesignTree.FindModelNode(ModelType.Entity, modelID);
    //     if (!sourceNode.Checkout())
    //         throw new Exception("无法签出当前模型");
    //     //3.查找引用并尝试签出相关节点
    //     var references = FindUsages(hub, referenceType, modelID, oldName);
    //     for (int i = 0; i < references.Count; i++)
    //     {
    //         var designNode = hub.DesignTree.FindModelNode(references[i].ModelType, references[i].ModelID);
    //         if (!designNode.Checkout())
    //             throw new Exception($"无法签出模型[{references[i].ModelID}]");
    //     }
    //     //4.重命名虚拟代码引用
    //     var workspace = hub.TypeSystem.Workspace;
    //     var symbols = hub.TypeSystem.GetEntityMemberSymbols(modelID, oldName);
    //     for (int i = 0; i < symbols.Length; i++)
    //     {
    //         var update = Renamer.RenameSymbolAsync(workspace.CurrentSolution,
    //             symbols[i], newName, workspace.Options).Result;
    //         //重新验证受影响的节点是否签出
    //         //todo:暂无法处理两个symbol一个应用更新成功，另一个失败的问题
    //         if (!workspace.TryApplyChanges(update))
    //             throw new Exception("无法进行重命名操作");
    //     }
    //     //5.重命名模型引用，如表达式内的引用

    //     //6.启用事务保存所有受影响的节点
    //     using (var ts = SqlStore.Default.NewTransactionScope())
    //     {
    //         var model = (EntityModel)sourceNode.Model;
    //         model.RenameMember(oldName, newName);
    //         sourceNode.Save(null);

    //         ts.Complete();
    //     }
    // }

    #endregion
}