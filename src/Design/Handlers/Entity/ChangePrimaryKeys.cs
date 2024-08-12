using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 设计时改变映射至数据库的实体模型的主键
/// </summary>
internal sealed class ChangePrimaryKeys : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var pks = args.GetArray<PrimaryKeyField>();

        var node = hub.DesignTree.FindModelNode(modelId);
        if (node == null)
            throw new Exception("Can't find Entity");
        if (!node.IsCheckoutByMe)
            throw new Exception("Has not checkout");
        var model = (EntityModel)node.Model;

        if (model.PersistentState != PersistentState.Detached)
        {
            //TODO:如果是修改则必须查找服务方法内的引用，签出节点并修改
            //1. new XXXX(pks)改为new XXX(/*fix pk changed*/)
            //2. Entities.XXX.FetchAsync(pks)同上
        }

        Run(model, pks);

        return new ValueTask<AnyValue>(AnyValue.Empty);
    }

    internal static void Run(EntityModel model, PrimaryKeyField[]? pks)
    {
        if (model.SqlStoreOptions == null)
            throw new NotSupportedException("Only for SqlStore");

        //同步处理可修改的主键字段所关联的跟踪成员
        var allPKTrackers = model.Members
            .Where(m => m.Type == EntityMemberType.EntityFieldTracker && ((FieldTrackerModel)m).IsUsedForChangeablePK)
            .Cast<FieldTrackerModel>()
            .ToList();
        if (pks == null)
        {
            model.SqlStoreOptions.SetPrimaryKeys(null);
            allPKTrackers.ForEach(model.RemoveMember);
        }
        else
        {
            //TODO: 注意如果选择的是EntityRef，则加入所有外键成员作为主键,目前前端仅EntityField
            model.SqlStoreOptions.SetPrimaryKeys(pks);
            var deletesTracker = allPKTrackers
                .Where(m => !pks.Any(p => p.AllowChange && p.MemberId == m.TargetMemberId))
                .ToList();
            deletesTracker.ForEach(model.RemoveMember);
            var addsTracker = pks
                .Where(p => p.AllowChange && allPKTrackers.All(m => m.TargetMemberId != p.MemberId))
                .ToList();
            addsTracker.ForEach(p =>
            {
                var name = $"Original{model.GetMember(p.MemberId)!.Name}";
                var pkTracker = new FieldTrackerModel(model, name, p.MemberId);
                model.AddMember(pkTracker);
                var newPKField = new PrimaryKeyField(p.MemberId, true, p.OrderByDesc);
                newPKField.TrackerMemberId = pkTracker.MemberId;
                var index = Array.IndexOf(pks, p);
                pks[index] = newPKField;
            });
        }
    }
}