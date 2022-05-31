using System.Text;
using AppBoxCore;
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
    public async Task<IActionResult> View(int sessionId, string viewModelId)
    {
        var session = WebSocketManager.FindSession(sessionId);
        if (session == null)
            throw new Exception("Can't find session");

        HostRuntimeContext.SetCurrentSession(session);

        var jsCodeData = (byte[])await RuntimeContext.InvokeAsync(
            "sys.DesignService.GetWebPreview", InvokeArgs.Make(viewModelId));
        return new FileContentResult(jsCodeData, "text/javascript");
    }

    /// <summary>
    /// 设计时获取实体模型的预览
    /// </summary>
    [HttpGet("Entity/{sessionId}/{entityModelId}")]
    public async Task<IActionResult> Entity(int sessionId, string entityModelId)
    {
        var session = WebSocketManager.FindSession(sessionId);
        if (session == null)
            throw new Exception("Can't find session");

        HostRuntimeContext.SetCurrentSession(session);

        var jsCodeData = (byte[])await RuntimeContext.InvokeAsync(
            "sys.DesignService.GetEntityPreview", InvokeArgs.Make(entityModelId));
        return new FileContentResult(jsCodeData, "text/javascript");
    }
}