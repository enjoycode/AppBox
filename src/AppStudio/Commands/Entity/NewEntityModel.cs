using AppBoxCore;

namespace AppBoxDesign;

internal static class NewEntityModel
{
    internal static Task<NewNodeResult> Execute(DesignNode selectedNode, string? storeId, string name)
    {
        if (name.StartsWith("Rx"))
            throw new Exception("Name can't start with Rx");

        var hub = DesignHub.Current;
        return ModelCreator.Make(DesignHub.Current, ModelType.Entity,
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
                    {
                        var appNode = hub.DesignTree.FindApplicationNode(id.AppId);
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