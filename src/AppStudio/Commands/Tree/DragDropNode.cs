using PixUI;

namespace AppBoxDesign;

internal static class DragDropNode
{
    internal static async ValueTask<int> Execute(DesignNode sourceNode, DesignNode targetNode, DropPosition position)
    {
        if (position != DropPosition.In)
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
}