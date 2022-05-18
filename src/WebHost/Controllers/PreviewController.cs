using System.Text;
using AppBoxCore;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

/// <summary>
/// 用于设计时预览生成视图模型的JS
/// </summary>
[ApiController]
[Route("[controller]")]
public class PreviewController : ControllerBase
{
    [HttpGet("{sessionId}/{viewModelId}")]
    public async Task<IActionResult> Get(int sessionId, string viewModelId)
    {
        var session = WebSocketManager.FindSession(sessionId);
        if (session == null)
            throw new Exception("Can't find session");

        HostRuntimeContext.SetCurrentSession(session);

        var jsCode = (string)await RuntimeContext.InvokeAsync(
            "sys.DesignService.GetWebPreview", InvokeArgs.Make(viewModelId));

        var data = Encoding.UTF8.GetBytes(jsCode);
        return new FileContentResult(data, "text/javascript");
    }
}