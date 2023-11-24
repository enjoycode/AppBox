using AppBoxCore;

namespace AppBoxDesign;

internal sealed class ChangePrimaryKeys : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var pks = args.GetArray<OrderedField>();

        var node = hub.DesignTree.FindModelNode(modelId);
        if (node == null)
            throw new Exception("Can't find Entity");
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");

        var model = (EntityModel)node.Model;
        if (model.SqlStoreOptions == null)
            throw new NotSupportedException("Only for SqlStore");

        if (model.PersistentState != PersistentState.Detached)
        {
            //TODO:如果是修改则必须查找服务方法内的引用，签出节点并修改
            //1. new XXXX(pks)改为new XXX(/*fix pk changed*/)
            //2. Entities.XXX.FetchAsync(pks)同上
        }

        if (pks == null)
            model.SqlStoreOptions.SetPrimaryKeys(null);
        else
        {
            //TODO: 注意如果选择的是EntityRef，则加入所有外键成员作为主键,目前前端仅EntityField
            model.SqlStoreOptions.SetPrimaryKeys(pks);
        }

        return new ValueTask<AnyValue>(AnyValue.Empty);
    }
}