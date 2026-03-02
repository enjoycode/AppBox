using System.Text;
using System.Text.Json;
using NUnit.Framework;
using AppBoxDesign.AI;

namespace Tests.AI.View;

public class ViewGenerateTest
{
    [Test]
    public async Task TestGenerateViewCode()
    {
        //Build request
        var req = new AIRequest();

        //Build system prompt
        var sb = new StringBuilder(1024);
        sb.Append(Resources.GetString("AI.View.SystemPrompt.md"));
        sb.Append(Resources.GetString("AI.View.Widgets.md"));
        var systemMessage = new AIMessage() { Role = "system", Content = sb.ToString() };
        req.Messages.Add(systemMessage);

        //Build user prompt
        var userMessage = new AIMessage()
        {
            Role = "user", Content = "请生成用户登录界面,系统的名称为AppStudio，表单标题红色显示,字体大小为28,宽度为400.用户名及密码输入框前有标题"
        };
        req.Messages.Add(userMessage);

        //Post request and wait response
        using var httpClient = new HttpClient();
        // Serialize object to JSON
        var reqJson = JsonSerializer.Serialize(req);
        // Create HTTP content with JSON and UTF-8 encoding
        var content = new StringContent(reqJson, Encoding.UTF8, "application/json");
        // Send POST request
        var httpResponse = await httpClient.PostAsync("http://localhost:11434/api/chat", content);
        // Ensure success
        httpResponse.EnsureSuccessStatusCode();
        // Read response JSON
        var responseJson = await httpResponse.Content.ReadAsStringAsync();
        // Deserialize response
        var res = JsonSerializer.Deserialize<AIResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        Console.WriteLine(res!.Message.Content);
    }
}