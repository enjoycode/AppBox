using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityDialog : Dialog
{
    public NewEntityDialog(DesignStore designStore)
    {
        _designStore = designStore;
        Width = 300;
        Height = 210;
        Title.Value = "New Entity";
    }

    private readonly DesignStore _designStore;
    private readonly State<string> _name = "";
    private readonly State<DataStoreNode?> _store = new RxValue<DataStoreNode?>(null);

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children =
                {
                    new Form()
                    {
                        LabelWidth = 80,
                        Children = new[]
                        {
                            new FormItem("Name:", new TextInput(_name)),
                            new FormItem("DataStore:", new Select<DataStoreNode>(_store)
                            {
                                Options = GetAllDataStores()
                            })
                        }
                    }
                }
            }
        };
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK && !string.IsNullOrEmpty(_name.Value))
            CreateAsync();
        return base.OnClosing(result);
    }

    private async void CreateAsync()
    {
        throw new NotImplementedException();
        // var selectedNode = _designStore.TreeController.FirstSelectedNode;
        // if (selectedNode == null) return;
        //
        // var args = new object?[]
        // {
        //     (int)selectedNode.Data.Type, selectedNode.Data.Id, _name.Value,
        //     _store.Value == null ? null : _store.Value.Id
        // };
        //
        // var res = await Channel.Invoke<NewNodeResult_OLD>("sys.DesignService.NewEntityModel", args);
        // res!.ResolveToTree(_designStore);
        // //根据返回结果同步添加新节点
        // _designStore.OnNewNode(res!);
    }

    private DataStoreNode[] GetAllDataStores()
    {
        var dataStoreRootNode = (DataStoreRootNode)_designStore.TreeController.DataSource![0];
        var list = new DataStoreNode[dataStoreRootNode.Children!.Count + 1];
        list[0] = DataStoreNode.None;
        for (var i = 1; i < list.Length; i++)
        {
            list[i] = dataStoreRootNode.Children[i - 1];
        }

        return list;
    }
}