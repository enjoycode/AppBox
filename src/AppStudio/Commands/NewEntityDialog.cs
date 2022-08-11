using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityDialog : Dialog<object>
{
    public NewEntityDialog(Overlay overlay) : base(overlay)
    {
        Width = 300;
        Height = 180;
        Title.Value = "New Entity";
        OnClose = _OnClose;
    }

    private readonly State<string> _name = "";
    private readonly State<DataStoreNode?> _store = new Rx<DataStoreNode?>(null);

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
                            new FormItem("DataStore:", new Select<DataStoreNode>(_store)
                            {
                                Options = GetAllDataStores()
                            })
                        }
                    },
                    new Row(VerticalAlignment.Middle, 20)
                    {
                        Children = new Widget[]
                        {
                            new Button("Cancel") { Width = 65, OnTap = _ => Close(true) },
                            new Button("OK") { Width = 65, OnTap = _ => Close(false) },
                        }
                    }
                }
            }
        };
    }

    protected override object? GetResult(bool canceled) => null;

    private async void _OnClose(bool canceled, object? result)
    {
        if (canceled) return;
        if (string.IsNullOrEmpty(_name.Value)) return;

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

    private static DataStoreNode[] GetAllDataStores()
    {
        var dataStoreRootNode = (DataStoreRootNode)DesignStore.TreeController.DataSource![0];
        var list = new DataStoreNode[dataStoreRootNode.Children!.Count + 1];
        list[0] = DataStoreNode.None;
        for (var i = 1; i < list.Length; i++)
        {
            list[i] = (DataStoreNode)dataStoreRootNode.Children[i - 1];
        }

        return list;
    }
}