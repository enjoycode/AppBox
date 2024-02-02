using AppBoxCore;

namespace AppBoxDesign;

internal sealed class DragDropNode : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var sourceNodeType = (DesignNodeType)args.GetInt()!;
        var sourceNodeID = args.GetString()!;
        var targetNodeType = (DesignNodeType)args.GetInt()!;
        var targetNodeID = args.GetString()!;
        var position = (DropPosition)args.GetInt()!;

        var sourceNode = hub.DesignTree.FindNode(sourceNodeType, sourceNodeID);
        var targetNode = hub.DesignTree.FindNode(targetNodeType, targetNodeID);
        if (sourceNode == null || targetNode == null)
            throw new Exception("处理拖动时无法找到相应的节点");

        //TODO: 再次验证是否允许操作，前端已验证过
        if (position != DropPosition.Inner)
            throw new NotImplementedException("暂不支持除DropIn以外的操作");

        int insertIndex;
        if (sourceNode.Type == DesignNodeType.ModelNode)
        {
            if (!sourceNode.IsCheckoutByMe && !(await sourceNode.CheckoutAsync()))
                throw new Exception("拖动节点签出失败");
            insertIndex = await DropModelNodeInner((ModelNode)sourceNode, targetNode);
        }
        else if (sourceNode.Type == DesignNodeType.FolderNode)
        {
            var folderNode = (FolderNode)sourceNode;
            var modelRootNode = folderNode.ModelRootNode!;
            if (!modelRootNode.IsCheckoutByMe && !(await modelRootNode.CheckoutAsync()))
                throw new Exception("拖动节点签出失败");
            insertIndex = await DropFolderNodeInner(folderNode, targetNode);
        }
        else
            throw new NotSupportedException();

        return insertIndex;
    }

    private static async Task<int> DropModelNodeInner(ModelNode sourceNode, DesignNode targetNode)
    {
        int insertIndex;

        if (targetNode.Type == DesignNodeType.ModelRootNode)
        {
            var rootNode = (ModelRootNode)targetNode;
            var appNode = (ApplicationNode)rootNode.Parent!;
            if (appNode.Model.Id != sourceNode.Model.AppId)
                throw new InvalidOperationException("无法拖动模型节点至不同的Application内");

            RemoveFromParent(sourceNode);
            insertIndex = AddToParent(sourceNode, targetNode);
            sourceNode.Model.FolderId = null;
            await StagedService.SaveModelAsync(sourceNode.Model); //直接保存
        }
        else if (targetNode.Type == DesignNodeType.FolderNode)
        {
            var targetFolder = ((FolderNode)targetNode).Folder;
            var rootFolder = targetFolder.GetRoot();
            if (rootFolder.AppId != sourceNode.Model.AppId)
                throw new InvalidOperationException("无法拖动模型节点至不同的Application内");

            RemoveFromParent(sourceNode);
            insertIndex = AddToParent(sourceNode, targetNode);
            sourceNode.Model.FolderId = targetFolder.Id;
            await StagedService.SaveModelAsync(sourceNode.Model); //直接保存
        }
        else
        {
            throw new NotSupportedException();
        }

        return insertIndex;
    }

    private static async Task<int> DropFolderNodeInner(FolderNode sourceNode, DesignNode targetNode)
    {
        int insertIndex;
        if (targetNode.Type == DesignNodeType.ModelRootNode)
        {
            var rootNode = (ModelRootNode)targetNode;
            var appNode = (ApplicationNode)rootNode.Parent!;
            if (appNode.Model.Id != sourceNode.Folder.GetRoot().AppId)
                throw new InvalidOperationException("无法拖动至不同的Application内");

            RemoveFromParent(sourceNode);
            insertIndex = AddToParent(sourceNode, targetNode);
            sourceNode.Folder.Parent = rootNode.RootFolder;
            await sourceNode.SaveAsync(); //直接保存
        }
        else if (targetNode.Type == DesignNodeType.FolderNode)
        {
            var targetFolder = ((FolderNode)targetNode).Folder;
            var rootFolder = targetFolder.GetRoot();
            if (rootFolder.AppId != sourceNode.Folder.GetRoot().AppId)
                throw new InvalidOperationException("无法拖动至不同的Application内");

            RemoveFromParent(sourceNode);
            insertIndex = AddToParent(sourceNode, targetNode);
            sourceNode.Folder.Parent = targetFolder;
            await sourceNode.SaveAsync(); //直接保存
        }
        else
        {
            throw new NotSupportedException();
        }

        return insertIndex;
    }

    private static void RemoveFromParent(DesignNode node)
    {
        if (node.Parent is ModelRootNode modelRootNode)
            modelRootNode.Children.Remove(node);
        else if (node.Parent is FolderNode folderNode)
            folderNode.Children.Remove(node);
        else
            throw new NotImplementedException();
    }

    private static int AddToParent(DesignNode child, DesignNode parent)
    {
        if (parent is ModelRootNode modelRootNode)
            return modelRootNode.Children.Add(child);
        if (parent is FolderNode folderNode)
            return folderNode.Children.Add(child);
        throw new NotImplementedException();
    }

    private enum DropPosition
    {
        Inner,
        Before,
        After
    }
}