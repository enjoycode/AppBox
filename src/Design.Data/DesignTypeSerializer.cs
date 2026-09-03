using AppBoxCore;
using AppBoxDesign.Debugging;

namespace AppBoxDesign;

using static TypeSerializer;

/// <summary>
/// 设计时序列化注册
/// </summary>
public static class DesignTypeSerializer
{
    public static void Register()
    {
        RegisterKnownType<DataStoreModel>(PayloadType.DataStoreModel);
        RegisterKnownType<ApplicationModel>(PayloadType.ApplicationModel);
        RegisterKnownType<ModelFolder>(PayloadType.ModelFolder);
        RegisterPolymorphicType<ModelBase>(PayloadType.ModelBase);
        RegisterKnownType<EntityModel>(PayloadType.EntityModel);
        RegisterKnownType<ServiceModel>(PayloadType.ServiceModel);
        RegisterKnownType<ViewModel>(PayloadType.ViewModel);
        RegisterKnownType<PermissionModel>(PayloadType.PermissionModel);
        RegisterKnownType<ReportModel>(PayloadType.ReportModel);
        RegisterKnownType<EnumModel>(PayloadType.EnumModel);
        RegisterKnownType<WorkflowModel>(PayloadType.WorkflowModel);
        RegisterKnownType<CheckoutInfo>(PayloadType.CheckoutInfo);
        RegisterKnownType<CheckoutResult>(PayloadType.CheckoutResult);
        RegisterKnownType<PublishPackage>(PayloadType.PublishPackage);
        RegisterKnownType<DebugEventArgs>(PayloadType.DebugEventArgs);
        RegisterKnownType<DebugStartRequest>(PayloadType.DebugStartRequest);
    }
}