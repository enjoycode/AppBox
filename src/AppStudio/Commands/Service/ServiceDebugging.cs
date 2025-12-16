using AppBoxClient;
using AppBoxCore;

namespace AppBoxDesign;

internal static class ServiceDebugging
{
    public static async Task StartDebugging<T>(ModelNode modelNode, ServiceMethodInfo methodInfo, T args)
        where T : struct, IAnyArgs
    {
        var hub = DesignHub.Current;
        var serviceModel = (ServiceModel)modelNode.Model;
        var appName = modelNode.AppNode.Model.Name;
        var serviceName = serviceModel.Name;

        // 1.编译并上传服务模型
        var asmData = await Publish.CompileServiceAsync(hub, serviceModel, true);
        await Channel.Invoke("sys.DesignService.UploadDebugService", w =>
        {
            w.WriteString($"{appName}.{serviceName}");
            w.WriteBytes(asmData);
        });
    }
}