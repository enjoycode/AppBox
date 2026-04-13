using AppBoxCore;

namespace AppBoxDesign;

internal static class FindUsages
{
    internal static Task<List<Reference>> Execute(ModelReferenceType referenceType,
        ModelNode modelNode, string? memberName = null)
    {
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                var entityModel = (EntityModel)modelNode.Model;
                return ReferenceService.FindEntityMemberReferencesAsync(DesignHub.Current, modelNode,
                    entityModel.GetMember(memberName!)!);
            case ModelReferenceType.EntityModel:
            case ModelReferenceType.ServiceModel:
            case ModelReferenceType.ViewModel:
            case ModelReferenceType.EnumModel:
                return ReferenceService.FindModelReferencesAsync(DesignHub.Current, modelNode);
            case ModelReferenceType.EnumModelItem:
                return ReferenceService.FindEnumItemReferencesAsync(DesignHub.Current, modelNode, memberName!);
            default: throw new NotImplementedException(referenceType.ToString());
        }
    }
}