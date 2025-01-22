using AppBoxCore;

namespace AppBoxDesign;

internal static class FindUsages
{
    internal static async ValueTask<IList<Reference>> Execute(ModelReferenceType referenceType,
        ModelNode modelNode, string? memberName = null)
    {
        List<Reference> list;
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                var entityModel = (EntityModel)modelNode.Model;
                list = await ReferenceService.FindEntityMemberReferencesAsync(DesignHub.Current, modelNode,
                    entityModel.GetMember(memberName!)!);
                break;
            case ModelReferenceType.EntityModel:
            case ModelReferenceType.ServiceModel:
            case ModelReferenceType.ViewModel:
                list = await ReferenceService.FindModelReferencesAsync(DesignHub.Current, modelNode);
                break;
            default: throw new NotImplementedException();
        }

        return list;
    }
}