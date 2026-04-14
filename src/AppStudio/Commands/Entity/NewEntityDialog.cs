using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class NewEntityDialog : Dialog
{
    public NewEntityDialog(DesignHub designContext)
    {
        _designContext = designContext;
        Width = 300;
        Height = 210;
        Title.Value = "New Entity";
    }

    private readonly DesignHub _designContext;
    private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
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
                        Children =
                        [
                            new FormItem("Name:", new TextInput(_name)),
                            new FormItem("DataStore:", new Select<DataStoreNode>(_store)
                            {
                                Options = GetAllDataStores()
                            })
                        ]
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
        try
        {
            var selectedNode = DesignStore.TreeController.FirstSelectedNode;
            if (selectedNode == null) return;

            var result = await NewEntity(_designContext, selectedNode.Data, _store.Value?.Id, _name.Value);

            //根据返回结果同步添加新节点
            result.ResolveToTree(DesignStore);
            DesignStore.OnNewNode(result);
        }
        catch (Exception e)
        {
            Notification.Error(e.Message);
        }
    }

    private DataStoreNode[] GetAllDataStores()
    {
        var dataStoreRootNode = (DataStoreRootNode)DesignStore.TreeController.DataSource![0];
        var list = new DataStoreNode[dataStoreRootNode.Children.Count + 1];
        list[0] = DataStoreNode.None;
        for (var i = 1; i < list.Length; i++)
        {
            list[i] = dataStoreRootNode.Children[i - 1];
        }

        return list;
    }

    private static Task<NewNodeResult> NewEntity(DesignHub context, DesignNode selectedNode,
        string? storeId, string name)
    {
        if (name.StartsWith("Rx"))
            throw new Exception("Name can't start with Rx");

        return ModelCreator.Make(context, ModelType.Entity,
            id =>
            {
                var entityModel = new EntityModel(id, name);
                if (!string.IsNullOrEmpty(storeId))
                {
                    var storeNode = context.DesignTree.FindNode(DesignNodeType.DataStoreNode, storeId);
                    if (storeNode == null)
                        throw new Exception("Can't find DataStore");
                    var storeModel = ((DataStoreNode)storeNode).Model;
                    if (storeModel.Kind == DataStoreKind.Sql)
                    {
                        var appNode = context.DesignTree.FindApplicationNode(id.AppId);
                        entityModel.BindToSqlStore(storeModel.Id, appNode!.Model.Name + '.');
                    }
                    else
                        throw new NotImplementedException();
                }

                return entityModel;
            },
            selectedNode.Type, selectedNode.Id, name, _ => null);
    }
}