using NUnit.Framework;

namespace Tests.AI.View;

public class ViewGenerateTest
{
    [Test]
    public async Task TestGenerateViewCode()
    {
        using var chat = new MockAIChatForUI("qwen3.8", "http://localhost:11434/api/chat");
        await chat.SendUserPrompt("生成一个文本输入框");
        //await chat.SendUserPrompt("请生成用户登录界面,系统的名称为AppStudio");
        //await chat.SendUserPrompt("表单标题红色显示,字体大小为28,宽度为400.用户名及密码输入框前有标题");
    }
}