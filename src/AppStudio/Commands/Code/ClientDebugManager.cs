using AppBoxClient;
using AppBoxCore;
using AppBoxDesign.Debugging;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 客户端的调试管理器
/// </summary>
internal static class ClientDebugManager
{
    static ClientDebugManager()
    {
        //订阅服务端调试事件
        var subscriber = new DebugEventSubscriber();
        Channel.AddEventSubscriber(IDebugEventArgs.DebugEventId, subscriber, OnServerEvent);
    }

    private sealed class DebugEventSubscriber { }

    /// <summary>
    /// 收到服务端调试事件，解析并分发处理
    /// </summary>
    private static void OnServerEvent(IServerEventArgs args)
    {
        var eventArgs = (DebugEventArgs)args[0].GetObject()!;
        var modelNode = DesignHub.Current.DesignTree.FindModelNode(eventArgs.TargetModelId);
        if (modelNode == null)
        {
            Notification.Warn("Cannot find model node for debug event");
            return;
        }

        if (modelNode.Designer is not IDebuggableCodeDesigner designer)
        {
            Notification.Warn("Cannot find editor for debug event");
            return;
        }

        designer.OnDebugEvent(eventArgs.EventArgs);
    }

    /// <summary>
    /// 开始调试服务模型
    /// </summary>
    public static async Task StartDebugService(ModelNode modelNode, ServiceMethodInfo methodInfo, int[] breakpoints)
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

        // 2.开始启动调试 TODO:没有Breakpoint提示请求确认
        await Channel.Invoke("sys.DesignService.StartDebugService", w =>
        {
            //写入模型标识
            w.WriteLong(serviceModel.Id);
            //写入待调试的服务方法
            w.WriteString(appName);
            w.WriteString(serviceName);
            w.WriteString(methodInfo.Name);
            //写入Breakpoints
            w.WriteVariant(breakpoints.Length);
            for (var i = 0; i < breakpoints.Length; i++)
            {
                w.WriteInt(breakpoints[i] + 1 /*暂加1行*/);
            }
            //TODO:最后写入调用参数
        });
    }

    public static Task ResumeDebugService()
    {
        return Channel.Invoke("sys.DesignService.ResumeDebugService");
    }
}