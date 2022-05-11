using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class DesignTreePad : View
    {
        private readonly State<string> _searchKey = "";
        private bool _hasLoadTree = false;

        public DesignTreePad()
        {
            Child = new Column
            {
                Children = new Widget[]
                {
                    new Input(_searchKey) { Prefix = new Icon(Icons.Filled.Search) },
                    new TreeView<IDesignNode>(DesignStore.TreeController),
                }
            };
        }

        internal static void BuildTreeNode(IDesignNode data, TreeNode<IDesignNode> node)
        {
            node.Icon = new Icon(GetIconForNode(data));
            node.Label = new Text(data.Label);
            node.IsLeaf = data.Children == null || data.Children.Count == 0;
            node.IsExpanded = data.Type == DesignNodeType.DataStoreRootNode ||
                              data.Type == DesignNodeType.ApplicationRoot;
        }

        private static IconData GetIconForNode(IDesignNode data)
        {
            switch (data.Type)
            {
                case DesignNodeType.DataStoreNode: return Icons.Filled.Storage;
                case DesignNodeType.ApplicationNode: return Icons.Filled.Widgets;
                case DesignNodeType.ModelNode: return Icons.Filled.TableChart; //TODO:
                default: return Icons.Filled.Folder;
            }
        }

        protected override void OnMounted()
        {
            base.OnMounted();

            LoadDesignTree();
        }

        private async Task LoadDesignTree()
        {
            if (_hasLoadTree) return;
            _hasLoadTree = true;

            var tree = (IDesignTree)await Channel.Invoke("sys.DesignService.LoadDesignTree");
            DesignStore.TreeController.DataSource = tree.RootNodes;
        }
    }
}