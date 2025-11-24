using AppBoxCore;
using AppBoxServer;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

/// <summary>
/// 用于设计时预览生成模型的JS
/// </summary>
[ApiController]
[Route("[controller]")]
public class PreviewController : ControllerBase
{
    /// <summary>
    /// 设计时获取视图模型预览
    /// </summary>
    [HttpGet("View/{sessionId}/{viewModelId}")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<IActionResult> View(string sessionId, string viewModelId)
    {
        var session = WebSocketManager.FindSession(sessionId);
        if (session == null)
            throw new Exception("Can't find session");

        HostRuntimeContext.SetCurrentSession(session);

        var jsCodeData = (byte[])await RuntimeContext.Current.InvokeAsync("sys.DesignService.GetWebPreview",
#if DEBUG
            InvokeArgs.Make(viewModelId, Request.Headers.ContainsKey("ViteDev")));
#else
            InvokeArgs.Make(viewModelId));
#endif
        return new FileContentResult(jsCodeData, "text/javascript");
    }

    /// <summary>
    /// 设计时获取实体模型的预览
    /// </summary>
    [HttpGet("Entity/{sessionId}/{entityModelId}")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<IActionResult> Entity(string sessionId, string entityModelId)
    {
        var session = WebSocketManager.FindSession(sessionId);
        if (session == null)
            throw new Exception("Can't find session");

        HostRuntimeContext.SetCurrentSession(session);

        var jsCodeData = (byte[])await RuntimeContext.Current.InvokeAsync("sys.DesignService.GetEntityPreview",
#if DEBUG
            InvokeArgs.Make(entityModelId, Request.Headers.ContainsKey("ViteDev")));
#else
            InvokeArgs.Make(entityModelId));
#endif
        return new FileContentResult(jsCodeData, "text/javascript");
    }
}