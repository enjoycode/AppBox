using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 显示对话框操作
/// </summary>
public sealed class ShowDialog : IEventAction
{
    public string ActionName => nameof(ShowDialog);

    public int DialogWidth { get; private set; } = 400;
    public int DialogHeight { get; private set; } = 300;

    /// <summary>
    /// 显示视图模型的名称, eg: sys.CustomerEditView
    /// </summary>
    public string TargetView { get; private set; } = null!;

    /// <summary>
    /// 目标视图的参数列表
    /// </summary>
    public List<ViewParameter> Parameters { get; } = [];

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteNumber(nameof(DialogWidth), DialogWidth);
        writer.WriteNumber(nameof(DialogHeight), DialogHeight);
        writer.WriteString(nameof(TargetView), TargetView);
        writer.WriteStartArray();
        foreach (var parameter in Parameters)
        {
            writer.WriteStartObject();
            writer.WriteString(nameof(parameter.StateName), parameter.StateName);
            writer.WriteString("SourceType", parameter.Source.Name);
            parameter.Source.WriteProperties(writer);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        throw new NotImplementedException();
    }

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        throw new NotImplementedException();
    }
}