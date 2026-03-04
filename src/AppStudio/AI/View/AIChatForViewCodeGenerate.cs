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
        sb.Append(_widgets);

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

    #region ====Test Avaliable Wdigets====

    private readonly string _widgets = """
                                       # AVAILABLE WIDGETS

                                       * Text

                                       ```json
                                       {
                                         "Summary": "显示文本",
                                         "Properties": [
                                           { "Name": "Text", "Type": "State<string>" },
                                           { "Name": "TextColor", "Type": "State<Color>?", "Summary": "可选文本颜色" },
                                           { "Name": "FontSize", "Type": "State<float>?", "Summary": "可选字体大小" },
                                           { "Name": "Width", "Type": "State<float>?", "Summary": "指定的宽度" },
                                           { "Name": "Height", "Type": "State<float>?", "Summary": "指定的高度" }
                                         ]
                                       }
                                       ```

                                       * Center

                                       ```json
                                       {
                                         "Summary": "布局时将子组件居中",
                                         "Properties": [
                                           { "Name": "Child", "Type": "Widget?>" }
                                         ]
                                       }
                                       ```

                                       * Row

                                       ```json
                                       {
                                         "Summary": "按行排列各个子组件",
                                         "Properties": [
                                           { "Name": "Spacing", "Type": "float", "Summary": "每个子组件的间隙" },
                                           { "Name": "Children", "Type": "IList<Widget>" },
                                           { "Name": "Alignment", "Type": "VerticalAlignment", "Summary": "子组件的垂直对齐方式"}
                                         ]
                                       }
                                       ```

                                       * Column

                                       ```json
                                       {
                                         "Summary": "按列排列各个子组件",
                                         "Properties": [
                                           { "Name": "Spacing", "Type": "float", "Summary": "每个子组件的间隙" },
                                           { "Name": "Children", "Type": "IList<Widget>" },
                                           { "Name": "Alignment", "Type": "HorizontalAlignment", "Summary": "子组件的水平对齐方式" }
                                         ]
                                       }
                                       ```

                                       * Button

                                       ```json
                                       {
                                         "Summary": "按钮，通过设置OnTap属性绑定事件处理",
                                         "Properties": [
                                           { "Name": "Text", "Type": "State<string>?", "Summary": "按钮的文本" },
                                           { "Name": "OnTap", "Type": "Action<PointerEvent>" }
                                         ]
                                       }
                                       ```

                                       * Card
                                       ```json
                                       {
                                         "Summary": "Elevated card container",
                                         "Properties": [
                                           { "Name": "Color", "Type": "State<Color>?" },
                                           { "Name": "ShadowColor", "Type": "State<Color>?" },
                                           { "Name": "Elevation", "Type": "State<float>?" },
                                           { "Name": "Width", "Type": "State<float>?", "Summary": "指定的宽度"},
                                           { "Name": "Height", "Type": "State<float>?", "Summary": "指定的高度"}
                                         ]
                                       }
                                       ```

                                       * TextInput

                                       ```json
                                       {
                                         "Summary": "文本输入框",
                                         "Properties": [
                                           { "Name": "Text", "Type": "State<string>" },
                                           { "Name": "TextColor", "Type": "State<Color>?", "Summary": "文本的颜色"},
                                           { "Name": "IsObscure", "Type": "bool", "Summary": "是否隐藏文本，用于密码输入" }
                                         ]
                                       }
                                       ```
                                       """;

    #endregion
}