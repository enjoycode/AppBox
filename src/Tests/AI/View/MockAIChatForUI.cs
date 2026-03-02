using System.Text;
using AppBoxDesign.AI;

namespace Tests.AI;

internal sealed class MockAIChatForUI : AIChat
{
    public MockAIChatForUI(string model, string url) : base(model, url) { }

    protected override string BuildSystemPrompt()
    {
        var sb = new StringBuilder(1024);
        sb.Append(Resources.GetString("AI.View.SystemPrompt.md"));
        sb.Append(Resources.GetString("AI.View.Widgets.md"));
        return sb.ToString();
    }

    protected override void ParseAIResponse(AIMessage responseMessage)
    {
        Console.WriteLine($"Role: {responseMessage.Role}");
        Console.WriteLine(responseMessage.Content);
    }
}