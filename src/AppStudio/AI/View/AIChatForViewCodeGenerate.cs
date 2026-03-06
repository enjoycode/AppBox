using System.Text;

namespace AppBoxDesign.AI;

internal sealed class AIChatForViewCodeGenerate : AIChat
{
    public AIChatForViewCodeGenerate(string model, string url, IAIGeneratable generator) : base(model, url)
    {
        _generator = generator;
    }

    private readonly IAIGeneratable _generator;

    protected override string BuildSystemPrompt()
    {
        var sb = new StringBuilder(1024);
        sb.Append(Resources.LoadString("AI.View.SystemPrompt.md"));
        sb.Append(Resources.LoadString("AI.View.Widgets.md"));

        sb.AppendLine($"重要: 输出的namespace为{_generator.GetAppName()}.Views, class name为{_generator.GetModelName()}.");
        return sb.ToString();
    }

    protected override string BuildUserPrompt(string userPrompt, bool isNew)
    {
        if (!isNew)
            return userPrompt;

        var sb = new StringBuilder();
        sb.AppendLine("# 现有输出:");
        //sb.AppendLine("```csharp");
        sb.AppendLine(_generator.GetCurrentContent());
        //sb.AppendLine("```");

        sb.AppendLine("# 用户需求:");
        sb.AppendLine(userPrompt);

        return sb.ToString();
    }

    protected override void ParseAIResponse(AIMessage responseMessage)
    {
        if (responseMessage.Role == "assistant")
        {
            //should check the response format.
            _generator.SetCurrentContent(responseMessage.Content);
        }
        else
        {
            Console.WriteLine(responseMessage.Role);
            Console.WriteLine(responseMessage.Content);
        }
    }
}