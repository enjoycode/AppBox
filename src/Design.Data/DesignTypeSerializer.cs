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
        //@formatter:off
        RegisterKnownType(new BinSerializer(PayloadType.DataStoreModel, typeof(DataStoreModel), () => new DataStoreModel()));
        RegisterKnownType(new BinSerializer(PayloadType.ApplicationModel, typeof(ApplicationModel), () => new ApplicationModel()));
        RegisterKnownType(new BinSerializer(PayloadType.ModelFolder, typeof(ModelFolder), () => new ModelFolder()));
        RegisterKnownType(new BinSerializer(PayloadType.ModelBase, typeof(ModelBase)));
        RegisterKnownType(new BinSerializer(PayloadType.EntityModel, typeof(EntityModel), () => new EntityModel()));
        RegisterKnownType(new BinSerializer(PayloadType.ServiceModel, typeof(ServiceModel), () => new ServiceModel()));
        RegisterKnownType(new BinSerializer(PayloadType.ViewModel, typeof(ViewModel), () => new ViewModel()));
        RegisterKnownType(new BinSerializer(PayloadType.PermissionModel, typeof(PermissionModel), () => new PermissionModel()));
        RegisterKnownType(new BinSerializer(PayloadType.ReportModel, typeof(ReportModel), () => new ReportModel()));
        RegisterKnownType(new BinSerializer(PayloadType.CheckoutInfo, typeof(CheckoutInfo), () => new CheckoutInfo()));
        RegisterKnownType(new BinSerializer(PayloadType.CheckoutResult, typeof(CheckoutResult), () => new CheckoutResult()));
        RegisterKnownType(new BinSerializer(PayloadType.PendingChange, typeof(PendingChange), () => new PendingChange()));
        RegisterKnownType(new BinSerializer(PayloadType.PublishPackage, typeof(PublishPackage), () => new PublishPackage()));
        RegisterKnownType(new BinSerializer(PayloadType.DebugEventArgs, typeof(DebugEventArgs), () => new DebugEventArgs()));
        //@formatter:on
    }
}