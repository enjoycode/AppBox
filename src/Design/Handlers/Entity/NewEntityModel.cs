using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 新建实体模型
/// </summary>
internal sealed class NewEntityModel : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt()!.Value;
        var selectedNodeId = args.GetString()!;
        var name = args.GetString()!;
        var storeId = args.GetString();

        if (name.StartsWith("Rx")) //保留Rx头
            throw new Exception("Name can't start with Rx");

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
                    {
                        var appNode = hub.DesignTree.FindApplicationNode(id.AppId);
                        entityModel.BindToSqlStore(storeModel.Id, appNode!.Model.Name + '.');
                    }
                    else
                        throw new NotImplementedException();
                }

                return entityModel;
            },
            selectedNodeType, selectedNodeId, name, _ => null);
        return AnyValue.From(result);
    }
}