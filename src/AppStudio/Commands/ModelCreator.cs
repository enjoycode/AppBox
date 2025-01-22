using AppBoxCore;

namespace AppBoxDesign;

internal static class ModelCreator
{
    public static async Task<NewNodeResult> Make(DesignHub hub, ModelType modelType,
        Func<ModelId, ModelBase> creator,
        DesignNodeType selectedNodeType, string selectedNodeId, string name,
        Func<string, string?> initSrcCodeGen)
    {
        //验证名称有效性
        if (string.IsNullOrEmpty(name) || !CodeUtil.IsValidIdentifier(name))
            throw new Exception("Name invalid");
        //获取选择的节点
        var selectedNode = hub.DesignTree.FindNode(selectedNodeType, selectedNodeId);
        if (selectedNode == null)
            throw new Exception("Can't find selected node");
        //根据选择的节点获取合适的插入位置
        var parentNode = DesignTree.FindNewModelParentNode(selectedNode, modelType);
        if (parentNode == null)
            throw new Exception("Can't find parent node");
        var appNode = DesignTree.FindAppNodeFromNode(parentNode)!;
        var appId = appNode.Model.Id;
        //判断名称是否已存在
        if (hub.DesignTree.IsModelNameExists(appId, modelType, name.AsMemory()))
            throw new Exception("Name has exists");

        //判断当前模型根节点有没有签出
        var modelRootNode = hub.DesignTree.FindModelRootNode(appId, modelType)!;
        var modelRootNodeHasCheckout = modelRootNode.IsCheckoutByMe;
        var checkoutOk = await modelRootNode.CheckoutAsync();
        if (!checkoutOk)
            throw new Exception("Can't checkout ModelRootNode");

        //生成模型标识号并新建模型及节点 //TODO:fix Layer
        var modelId = await MetaStoreService.GenModelIdAsync(appId, modelType, ModelLayer.DEV);
        var model = creator(modelId);
        var node = new ModelNode(model, hub);
        var insertIndex = parentNode.Type == DesignNodeType.ModelRootNode
            ? modelRootNode.Children.Add(node)
            : ((FolderNode)parentNode).Children.Add(node);
        modelRootNode.AddModelIndex(node); //添加至模型根节点的索引内
        //设置文件夹
        if (parentNode is FolderNode folderNode)
            model.FolderId = folderNode.Folder.Id;
        //设为签出状态
        node.CheckoutInfo = new CheckoutInfo(node.Type, node.CheckoutTargetId, model.Version,
            hub.SessionName, hub.LeafOrgUnitId);

        //保存至Staged
        var initSrcCode = initSrcCodeGen(appNode.Model.Name);
        await node.SaveAsync(initSrcCode);
        //创建RoslynDocument
        await hub.TypeSystem.CreateModelDocumentAsync(node, initSrcCode);

        return new NewNodeResult(parentNode.Type, parentNode.Id, node,
            modelRootNodeHasCheckout ? null : modelRootNode.Id, insertIndex);
    }
}