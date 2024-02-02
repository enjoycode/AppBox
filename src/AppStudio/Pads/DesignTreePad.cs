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
                new TreeView<DesignNodeVO>(_designStore.TreeController, BuildTreeNode, n => n.Children!)
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

    private static void BuildTreeNode(TreeNode<DesignNodeVO> node)
    {
        var data = node.Data;
        node.Icon = new Icon(GetIconForNode(data));
        node.Label = new Text(data.Label);
        node.IsLeaf = data.Type is DesignNodeType.ModelNode or DesignNodeType.DataStoreNode;
        node.IsExpanded = data.Type is DesignNodeType.DataStoreRootNode
            or DesignNodeType.ApplicationRoot
            or DesignNodeType.ApplicationNode;
    }

    private static IconData GetIconForNode(DesignNodeVO data)
    {
        switch (data.Type)
        {
            case DesignNodeType.DataStoreNode: return MaterialIcons.Storage;
            case DesignNodeType.ApplicationNode: return MaterialIcons.Widgets;
            case DesignNodeType.ModelNode:
                return IconUtil.GetIconForModelType(((ModelNodeVO)data).ModelType);
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
            var res = await Channel.Invoke<DesignTreeVO>("sys.DesignService.LoadDesignTree");
            _designStore.TreeController.DataSource = res!.RootNodes;
        }
        catch (System.Exception ex)
        {
            Notification.Error($"Can't load design tree: {ex.Message}");
        }
        finally
        {
            _designStore.TreeController.IsLoading = false;
        }
    }

    #region ====DragDrop TreeNode====

    private static bool OnAllowDrag(TreeNode<DesignNodeVO> node)
    {
        //目前仅FolderNode及ModelNode
        return node.Data.Type is DesignNodeType.FolderNode or DesignNodeType.ModelNode;
    }

    private static bool OnAllowDrop(TreeNode<DesignNodeVO> target, DragEvent e)
    {
        var source = e.TransferItem as TreeNode<DesignNodeVO>;
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

    private async void OnDrop(TreeNode<DesignNodeVO> target, DragEvent e)
    {
        var source = (TreeNode<DesignNodeVO>)e.TransferItem;
        // Log.Debug($"OnDrop: {source.Data} {target.Data} {e.DropPosition}");
        // 暂由后端判断并尝试签出相关节点
        var args = new object?[]
            { (int)source.Data.Type, source.Data.Id, (int)target.Data.Type, target.Data.Id, (int)e.DropPosition };
        try
        {
            var insertIndex = await Channel.Invoke<int>("sys.DesignService.DragDropNode", args)!;
            Debug.Assert(insertIndex >= 0);
            var treeController = _designStore.TreeController;
            treeController.RemoveNode(source);
            treeController.InsertNode(source.Data, target, insertIndex);
        }
        catch (Exception ex)
        {
            Notification.Error($"拖动节点失败: {ex.Message}");
        }
    }

    #endregion
}