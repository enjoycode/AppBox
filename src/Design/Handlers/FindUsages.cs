using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 查找模型或模型成员的引用项
/// </summary>
internal sealed class FindUsages : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var referenceType = (ModelReferenceType)args.GetInt()!.Value;
        ModelId modelId = args.GetString()!;
        var memberName = args.GetString();

        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception("Can't find ModelNode");

        List<Reference> list;
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                var entityModel = (EntityModel)modelNode.Model;
                list = await ReferenceService.FindEntityMemberReferencesAsync(hub, modelNode,
                    entityModel.GetMember(memberName!)!);
                break;
            case ModelReferenceType.EntityModel:
            case ModelReferenceType.ServiceModel:
            case ModelReferenceType.ViewModel:
                list = await ReferenceService.FindModelReferencesAsync(hub, modelNode);
                break;
            default: throw new NotImplementedException();
        }

        return AnyValue.From(list.Select(ReferenceVO.From).ToList());
    }
}