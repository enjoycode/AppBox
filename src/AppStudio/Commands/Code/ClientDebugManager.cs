using AppBoxClient;
using AppBoxCore;
using AppBoxCore.Channel;
using AppBoxDesign.Debugging;

namespace AppBoxDesign;

/// <summary>
/// 客户端的调试管理器
/// </summary>
internal static class ClientDebugManager
{
    /// <summary>
    /// 开始调试服务模型
    /// </summary>
    public static async Task StartDebugService(IDebuggableCodeDesigner designer,
        ServiceMethodInfo methodInfo, int[] breakpoints)
    {
        var hub = designer.ModelNode.DesignTree!.DesignContext;
        var serviceModel = (ServiceModel)designer.ModelNode.Model;
        var appName = designer.ModelNode.AppName;
        var serviceName = serviceModel.Name;

        // 1.编译并上传服务模型
        var pipeWriter = new PipeBytesWriter(async w =>
        {
            var stream = new PipeWriteStream(w);
            await PublishCommand.CompileServiceAsync(stream, hub, serviceModel, true);
        });
        await Channel.Upload(DesignMethods.DebugUploadServiceFull, pipeWriter, $"{appName}.{serviceName}");
        //TODO: check pipeWriter error, maybe compile service error.

        // 2.订阅调试事件
        Channel.AddEventSubscriber(IDebugEventArgs.DebugEventId, designer, args =>
        {
            var eventArgs = (DebugEventArgs)args[0].GetObject()!;
            if (eventArgs.TargetModelId == designer.ModelNode.Model.Id)
                designer.OnDebugEvent(eventArgs.EventArgs);
        });

        // 3.开始启动调试 TODO:没有Breakpoint提示请求确认
        var request = new DebugStartRequest()
        {
            ModelId = serviceModel.Id,
            AppName = appName,
            ServiceName = serviceName,
            MethodName = methodInfo.Name,
            Breakpoints = breakpoints
        };
        await Channel.Invoke(DesignMethods.DebugStartFull, AnyValue.From(request));
    }

    public static Task ResumeDebugService() => Channel.Invoke(DesignMethods.DebugResumeFull);

    /// <summary>
    /// 设计器内正常结束调试过程
    /// </summary>
    public static void OnDebuggerExited(IDebuggableCodeDesigner designer)
    {
        Channel.RemoveEventSubscriber(IDebugEventArgs.DebugEventId, designer);
    }

    /// <summary>
    /// 设计器关闭时主动中断调试过程
    /// </summary>
    public static Task ExitDebugService(IDebuggableCodeDesigner designer)
    {
        Channel.RemoveEventSubscriber(IDebugEventArgs.DebugEventId, designer);
        return Channel.Invoke(DesignMethods.DebugExitFull);
    }

    public static async Task<EvaluateResult> EvaluateExpression(string expression)
    {
        var result = await Channel.Invoke<DebugEventArgs>(DesignMethods.DebugEvaluateFull, expression);
        if (result == null)
            throw new Exception("EvaluateResult is null");
        return (EvaluateResult)result.EventArgs;
    }

    public static async Task<List<EvaluateResult>> ListChildren(string variableName)
    {
        var result = await Channel.Invoke<DebugEventArgs>(DesignMethods.DebugListChildrenFull, variableName);
        if (result == null)
            throw new Exception("ListChildren result is null");

        return ((VariableChildren)result.EventArgs).Children;
    }
}