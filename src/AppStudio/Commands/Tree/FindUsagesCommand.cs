using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class FindUsagesCommand : DesignCommand
{
    public FindUsagesCommand(DesignHub context) : base(context) { }

    public async void Execute()
    {
        try
        {
            var designer = DesignStore.ActiveDesigner;
            if (designer is not IModelDesigner modelDesigner) return;

            var modelNode = modelDesigner.ModelNode;
            var type = ModelTypeToReferenceType(modelNode.ModelType);
            var list = await Find(Context, type, modelNode);
            DesignStore.UpdateUsages(list);
        }
        catch (Exception ex)
        {
            Notification.Error($"Find usages error: {ex.Message}");
        }
    }

    internal static ModelReferenceType ModelTypeToReferenceType(ModelType type) => type switch
    {
        ModelType.Entity => ModelReferenceType.EntityModel,
        ModelType.Service => ModelReferenceType.ServiceModel,
        ModelType.View => ModelReferenceType.ViewModel,
        ModelType.Enum => ModelReferenceType.EnumModel,
        ModelType.Permission => ModelReferenceType.PermissionModel,
        ModelType.Report => ModelReferenceType.ReportModel,
        ModelType.Workflow => ModelReferenceType.WorkflowModel,
        _ => throw new NotImplementedException(type.ToString())
    };

    internal static Task<List<Reference>> Find(DesignHub context, ModelReferenceType referenceType,
        ModelNode modelNode, string? memberName = null)
    {
        switch (referenceType)
        {
            case ModelReferenceType.EntityMember:
                var entityModel = (EntityModel)modelNode.Model;
                return ReferenceService.FindEntityMemberReferencesAsync(context, modelNode,
                    entityModel.GetMember(memberName!)!);
            case ModelReferenceType.EntityModel:
            case ModelReferenceType.ServiceModel:
            case ModelReferenceType.ViewModel:
            case ModelReferenceType.EnumModel:
                return ReferenceService.FindModelReferencesAsync(context, modelNode);
            case ModelReferenceType.EnumModelItem:
                return ReferenceService.FindEnumItemReferencesAsync(context, modelNode, memberName!);
            default: throw new NotImplementedException(referenceType.ToString());
        }
    }
}