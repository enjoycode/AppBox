using AppBoxCore;
using AppBoxServer;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

[ApiController]
[Route("[controller]")]
public sealed class BlobController : ControllerBase
{
    /// <summary>
    /// 通过服务验证并处理上传的文件，注意单文件上传，由前端处理多文件上传
    /// </summary>
    /// <param name="sessionId"></param>
    /// <param name="processor">处理上传的临时文件 eg: SERP.ProductService.ProcessImage</param>
    /// <param name="args"></param>
    [HttpPost("/rest/upload/{sessionId}/{processor}/{args}")]
    public async Task<IActionResult> Upload(string sessionId, string processor, string args)
    {
        if (string.IsNullOrEmpty(sessionId) || string.IsNullOrEmpty(processor))
            return BadRequest("Must assign sessionId and processor service.");
        if (Request.Form.Files.Count != 1)
            return BadRequest("Only one file one time.");

        var formFile = Request.Form.Files[0];

        //设置当前用户会话
        if (ExternalSessionManager.Provider.TryGet(sessionId, out var session))
            HostRuntimeContext.SetCurrentSession(session);
        else
            return BadRequest("Session not exists");

        //1.保存为临时文件
        var tempFile = Path.Combine(Path.GetTempPath(), formFile.Name);
        try
        {
            await using var fs = System.IO.File.OpenWrite(tempFile);
            await formFile.CopyToAsync(fs);
        }
        catch (Exception ex)
        {
            return BadRequest("Save temp file error: " + ex.Message);
        }

        //2.调用处理服务
        AnyValue res;
        try
        {
            res = await RuntimeContext.Current.InvokeAsync(processor,
                AnyArgs.Make(formFile.Name, tempFile, (int)formFile.Length, args));
        }
        catch (Exception ex)
        {
            System.IO.File.Delete(tempFile); //仅处理失败删除临时文件
            return BadRequest("Process upload file error: " + ex.Message);
        }

        return Ok(res.BoxedValue);
    }

    /// <summary>
    /// 通过服务验证并处理下载文件，注意处理器先写入临时文件
    /// </summary>
    /// <param name="sessionId"></param>
    /// <param name="processor"></param>
    /// <param name="args"></param>
    /// <returns></returns>
    [HttpGet("/rest/download/{sessionId}/{processor}/{args}")]
    public async Task<IActionResult> Download(string sessionId, string processor, string args)
    {
        if (string.IsNullOrEmpty(sessionId) || string.IsNullOrEmpty(processor))
            return BadRequest("Must assign sessionId and processor service.");
        //设置当前用户会话
        if (ExternalSessionManager.Provider.TryGet(sessionId, out var session))
            HostRuntimeContext.SetCurrentSession(session);
        else
            return BadRequest("Session not exists");

        try
        {
            var res = await RuntimeContext.Current.InvokeAsync(processor, AnyArgs.Make(args));
            var tempFilePath = (string)res.BoxedValue!;
            return new PhysicalFileResult(tempFilePath, FileContentType.GetMimeType(Path.GetExtension(tempFilePath)));
        }
        catch (Exception ex)
        {
            return BadRequest("Process download file error: " + ex.Message);
        }
    }
}