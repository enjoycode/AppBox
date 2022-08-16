using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityDialog : Dialog
{
    public NewEntityDialog()
    {
        Width = 300;
        Height = 210;
        Title.Value = "New Entity";
    }

    private readonly State<string> _name = "";
    private readonly State<DataStoreNodeVO?> _store = new Rx<DataStoreNodeVO?>(null);

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Column()
            {
                Children = new Widget[]
                {
                    new Form()
                    {
                        LabelWidth = 80,
                        Children = new[]
                        {
                            new FormItem("Name:", new Input(_name)),
                            new FormItem("DataStore:", new Select<DataStoreNodeVO>(_store)
                            {
                                Options = GetAllDataStores()
                            })
                        }
                    }
                }
            }
        };
    }

    protected override bool OnClosing(bool canceled)
    {
        if (!canceled && !string.IsNullOrEmpty(_name.Value))
            CreateAsync();
        return base.OnClosing(canceled);
    }

    private async void CreateAsync()
    {
        var selectedNode = DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        var args = new object?[]
        {
            (int)selectedNode.Data.Type, selectedNode.Data.Id, _name.Value,
            _store.Value == null ? null : _store.Value.Id
        };

        var res = await Channel.Invoke<NewNodeResult>("sys.DesignService.NewEntityModel", args);
        //根据返回结果同步添加新节点
        DesignStore.OnNewNode(res!);
    }

    private static DataStoreNodeVO[] GetAllDataStores()
    {
        var dataStoreRootNode = (DataStoreRootNodeVO)DesignStore.TreeController.DataSource![0];
        var list = new DataStoreNodeVO[dataStoreRootNode.Children!.Count + 1];
        list[0] = DataStoreNodeVO.None;
        for (var i = 1; i < list.Length; i++)
        {
            list[i] = (DataStoreNodeVO)dataStoreRootNode.Children[i - 1];
        }

        return list;
    }
}