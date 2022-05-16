using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace AppBoxWebHost;

[ApiController]
[Route("[controller]")]
public class PreviewController : ControllerBase
{
    private static int _count = 0;

    [HttpGet("{sessionId}/{appName}/{viewName}")]
    public IActionResult Get(string sessionId, string appName, string viewName)
    {
        Console.WriteLine($"Preview: {sessionId} {appName} {viewName}");
        _count++;

        var sb = new StringBuilder(512);
        if (viewName != "DemoWidget")
            sb.Append("import {DemoWidget} from '/preview/1234/sys/DemoWidget';\n\n");

        sb.Append("export class ");
        sb.Append(viewName);
        sb.Append("{\n");
        sb.Append("\tSayHello() {\n");
        if (viewName == "DemoWidget")
        {
            sb.Append("\t\treturn 'Hello from DemoWidget ");
            sb.Append(_count);
            sb.Append("';\n");
        }
        else
        {
            sb.Append("\t\tlet demo = new DemoWidget();\n");
            sb.Append("\t\treturn demo.SayHello();\n");
        }

        sb.Append("\t}\n}");
        
        var data = Encoding.UTF8.GetBytes(sb.ToString());
        return new FileContentResult(data, "text/javascript");
    }
}