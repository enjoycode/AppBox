using AppBoxCore;

namespace AppBoxDesign;

internal sealed class NewEntityModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt();
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;
        var storeId = args.GetString();

        var result = await ModelCreator.Make(hub, ModelType.Entity,
            id =>
            {
                var entityModel = new EntityModel(id, name);
                if (!string.IsNullOrEmpty(storeId))
                {
                    var storeNode = hub.DesignTree.FindNode(DesignNodeType.DataStoreNode, storeId);
                    if (storeNode == null)
                        throw new Exception("Can't find DataStore");
                    var storeModel = ((DataStoreNode)storeNode).Model;
                    if (storeModel.Kind == DataStoreKind.Sql)
                        entityModel.BindToSqlStore(storeModel.Id);
                    else
                        throw new NotImplementedException();
                }

                return entityModel;
            },
            selectedNodeType, selectedNodeId, name, null);
        return AnyValue.From(result);
    }
}