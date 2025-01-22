using System;
using System.Diagnostics;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class DesignTreePad : View
{
    private readonly DesignStore _designStore;
    private readonly State<string> _searchKey = "";
    private bool _hasLoadTree = false;

    public DesignTreePad(DesignStore designStore)
    {
        _designStore = designStore;

        Child = new Column
        {
            Children =
            {
                new TextInput(_searchKey) { Prefix = new Icon(MaterialIcons.Search) },
                new TreeView<DesignNode>(_designStore.TreeController, BuildTreeNode,
                    n => n is IChildrenNode childrenNode ? childrenNode.GetChildren() : [])
                {
                    AllowDrag = true,
                    AllowDrop = true,
                    OnAllowDrag = OnAllowDrag,
                    OnAllowDrop = OnAllowDrop,
                    OnDrop = OnDrop,
                },
            }
        };
    }

    private static void BuildTreeNode(TreeNode<DesignNode> node)
    {
        var data = node.Data;
        node.Icon = new Icon(GetIconForNode(data));
        node.Label = new Text(data.Label);
        node.IsLeaf = data.Type is DesignNodeType.ModelNode or DesignNodeType.DataStoreNode;
        node.IsExpanded = data.Type is DesignNodeType.DataStoreRootNode
            or DesignNodeType.ApplicationRoot
            or DesignNodeType.ApplicationNode;
    }

    private static IconData GetIconForNode(DesignNode data)
    {
        switch (data.Type)
        {
            case DesignNodeType.DataStoreNode: return MaterialIcons.Storage;
            case DesignNodeType.ApplicationNode: return MaterialIcons.Widgets;
            case DesignNodeType.ModelNode:
                return IconUtil.GetIconForModelType(((ModelNode)data).ModelType);
            default: return MaterialIcons.Folder;
        }
    }

    protected override void OnMounted()
    {
        base.OnMounted();

        LoadDesignTree();
    }

    private async void LoadDesignTree()
    {
        if (_hasLoadTree) return;
        _hasLoadTree = true;

        _designStore.TreeController.IsLoading = true;
        try
        {
            await DesignHub.Current.DesignTree.LoadAsync();
            _designStore.TreeController.DataSource = DesignHub.Current.DesignTree.RootNodes;
        }
        catch (Exception ex)
        {
            Notification.Error($"Can't load design tree: {ex.Message}");
        }
        finally
        {
            _designStore.TreeController.IsLoading = false;
        }
    }

    #region ====DragDrop TreeNode====

    private static bool OnAllowDrag(TreeNode<DesignNode> node)
    {
        //目前仅FolderNode及ModelNode
        return node.Data.Type is DesignNodeType.FolderNode or DesignNodeType.ModelNode;
    }

    private static bool OnAllowDrop(TreeNode<DesignNode> target, DragEvent e)
    {
        var source = e.TransferItem as TreeNode<DesignNode>;
        if (source == null) return false;

        // var sourceType = source.Data.Type;
        var targetType = target.Data.Type;

        if (targetType != DesignNodeType.FolderNode && targetType != DesignNodeType.ModelRootNode)
            return false;
        if (e.DropPosition != DropPosition.In) //TODO: 特殊的支持排序
            return false;
        if (source.ParentNode == target)
            return false;
        if (DesignStore.GetModelRootNode(source) != DesignStore.GetModelRootNode(target))
            return false;

        return true;
    }

    private async void OnDrop(TreeNode<DesignNode> target, DragEvent e)
    {
        try
        {
            var source = (TreeNode<DesignNode>)e.TransferItem;
            // Log.Debug($"OnDrop: {source.Data} {target.Data} {e.DropPosition}");

            var insertIndex = await DragDropNode.Execute(source.Data, target.Data, e.DropPosition);
            Debug.Assert(insertIndex >= 0);
            var treeController = _designStore.TreeController;
            treeController.RemoveNode(source, false /*不需要同步*/);
            treeController.InsertNode(source.Data, target, insertIndex, false /*不需要同步*/);
        }
        catch (Exception ex)
        {
            Notification.Error($"拖动节点失败: {ex.Message}");
        }
    }

    #endregion
}