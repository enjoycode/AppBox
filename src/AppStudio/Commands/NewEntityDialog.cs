using AppBoxCore;
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
        if (_name.Value.StartsWith("Rx")) //保留Rx头
        {
            Notification.Error("Name can't start with Rx");
            return;
        }
        
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;
        var hub = DesignHub.Current;
        var storeId = _store.Value?.Id;
        
        var result = await ModelCreator.Make(DesignHub.Current, ModelType.Entity,
            id =>
            {
                var entityModel = new EntityModel(id, _name.Value);
                if (!string.IsNullOrEmpty(storeId))
                {
                    var storeNode = hub.DesignTree.FindNode(DesignNodeType.DataStoreNode, storeId);
                    if (storeNode == null)
                        throw new Exception("Can't find DataStore");
                    var storeModel = ((DataStoreNode)storeNode).Model;
                    if (storeModel.Kind == DataStoreKind.Sql)
                    {
                        var appNode = hub.DesignTree.FindApplicationNode(id.AppId);
                        entityModel.BindToSqlStore(storeModel.Id, appNode!.Model.Name + '.');
                    }
                    else
                        throw new NotImplementedException();
                }

                return entityModel;
            },
            selectedNode.Data.Type, selectedNode.Data.Id, _name.Value, _ => null);
        
        //根据返回结果同步添加新节点
        result.ResolveToTree(_designStore);
        _designStore.OnNewNode(result);
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