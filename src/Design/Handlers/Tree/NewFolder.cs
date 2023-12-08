using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewFolder : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        //读取参数
        var selectedNodeType = (DesignNodeType)args.GetInt()!.Value;
        var selectedNodeId = args.GetString();
        var name = args.GetString();

        if (string.IsNullOrEmpty(selectedNodeId) || string.IsNullOrEmpty(name))
            throw new Exception("名称不能为空");

        //获取选择的节点
        var selectedNode = hub.DesignTree.FindNode(selectedNodeType, selectedNodeId);
        if (selectedNode == null)
            throw new Exception("无法找到当前节点");
        //根据选择的节点获取合适的插入位置
        var parentNode = DesignTree.FindNewFolderParentNode(selectedNode, out var appId, out var modelType);
        if (parentNode == null)
            throw new Exception("无法找到上级节点");
        //判断是否已存在同名的
        DesignNodeList<DesignNode> children;
        if (parentNode is ModelRootNode modelRootNode)
            children = modelRootNode.Children;
        else if (parentNode is FolderNode folderNode)
            children = folderNode.Children;
        else
            throw new NotImplementedException();
        if (children.Exists(t => t.Type == DesignNodeType.FolderNode && t.Label == name))
            throw new Exception("当前目录下已存在同名文件夹");

        //判断当前模型根节点有没有签出
        var rootNode = hub.DesignTree.FindModelRootNode(appId, modelType)!;
        var rootNodeHasCheckout = rootNode.IsCheckoutByMe;
        if (!await rootNode.CheckoutAsync())
            throw new Exception($"Can't checkout: {rootNode.Label}");
        ////注意:需要重新引用上级文件夹节点，因自动签出上级节点可能已重新加载
        //if (!rootNodeHasCheckout && parentNode.NodeType == DesignNodeType.FolderNode)
        //{
        //    parentNode = rootNode.FindFolderNode(((FolderNode)parentNode).Folder.ID);
        //    if (parentNode == null)
        //        throw new Exception("上级节点已不存在，请刷新重试");
        //}

        // 判断选择节点即parentNode是文件夹还是模型根节点
        ModelFolder model;
        if (parentNode.Type == DesignNodeType.FolderNode)
        {
            model = new ModelFolder(((FolderNode)parentNode).Folder, name);
        }
        else if (parentNode.Type == DesignNodeType.ModelRootNode)
        {
            //判断是否存在根文件夹
            if (rootNode.RootFolder == null)
                rootNode.RootFolder = new ModelFolder(appId, rootNode.TargetType);
            model = new ModelFolder(rootNode.RootFolder, name);
        }
        else
            throw new Exception("不允许在此节点创建文件夹");

        var node = new FolderNode(model);
        //添加至设计树
        var insertIndex = children.Add(node);
        // 添加至根节点索引内
        rootNode.AddFolderIndex(node);
        // 保存到本地
        await node.SaveAsync();

        return AnyValue.From(
            new NewNodeResult(parentNode.Type, parentNode.Id,
                node, rootNodeHasCheckout ? null : rootNode.Id,
                insertIndex)
        );
    }
}