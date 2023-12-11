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
                new TreeView<DesignNodeVO>(_designStore.TreeController, BuildTreeNode, n => n.Children!),
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
}