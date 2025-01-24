using AppBoxStore;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

/// <summary>
/// 运行时获取模型的JS代码
/// </summary>
[ApiController]
[Route("[controller]")]
public class ModelController : ControllerBase
{
    /// <summary>
    /// 运行时获取视图模型的js文件
    /// </summary>
    [HttpGet("View/{viewName}")]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<IActionResult> View(string viewName)
    {
        //TODO:浏览器不支持压缩，另写入文件缓存

        var data = await MetaStore.Provider.LoadViewAssemblyAsync(viewName);
        if (data == null)
            return NotFound();

        Response.Headers.ContentEncoding = "br";
        return new FileContentResult(data, "text/javascript");
    }

    // /// <summary>
    // /// 运行时获取实体模型的js文件
    // /// </summary>
    // [HttpGet("Entity/{entityModelId}")]
    // [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    // public async Task<IActionResult> Entity(string entityModelId)
    // {
    //     var runtimeCtx = RuntimeContext.Current;
    //     var model = await runtimeCtx.GetModelAsync<EntityModel>(entityModelId);
    //     var jsCode = EntityJsGenerator.GenWebCode(model, runtimeCtx, false);
    //     return new FileContentResult(Encoding.UTF8.GetBytes(jsCode), "text/javascript");
    // }
}