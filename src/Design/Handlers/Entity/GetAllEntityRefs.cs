using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 获取引用了指定实体的所有EntityRef成员
/// </summary>
internal sealed class GetAllEntityRefs : IDesignHandler
{
    public ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var entityRefs = hub.DesignTree.FindAllEntityRefs(modelId);
        var res = entityRefs
            .Select(m => new EntityMemberInfo()
            {
                AppName = hub.DesignTree.FindApplicationNode(m.Owner.AppId)!.Model.Name,
                ModelName = m.Owner.Name,
                MemberName = m.Name,
                ModelId = m.Owner.Id.ToString(),
                MemberId = m.MemberId
            })
            .ToArray();

        return new ValueTask<AnyValue>(AnyValue.From(res));
    }
}