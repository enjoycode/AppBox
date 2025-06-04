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

    public int DialogWidth { get; internal set; } = 400;
    public int DialogHeight { get; internal set; } = 300;

    /// <summary>
    /// 显示视图模型的名称, eg: sys.CustomerEditView
    /// </summary>
    public string TargetView { get; internal set; } = string.Empty;

    /// <summary>
    /// 目标视图的参数列表
    /// </summary>
    public List<ViewParameter> Parameters { get; } = [];

    #region ====Serialization====

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteNumber(nameof(DialogWidth), DialogWidth);
        writer.WriteNumber(nameof(DialogHeight), DialogHeight);
        writer.WriteString(nameof(TargetView), TargetView);
        writer.WritePropertyName(nameof(Parameters));
        writer.WriteStartArray();
        foreach (var parameter in Parameters)
        {
            writer.WriteStartObject();
            writer.WriteString(nameof(ViewParameter.StateName), parameter.StateName);
            writer.WriteString("SourceType", parameter.Source.Name);
            parameter.Source.WriteProperties(writer);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            if (reader.TokenType == JsonTokenType.PropertyName)
            {
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(DialogWidth):
                        reader.Read();
                        DialogWidth = reader.GetInt32();
                        break;
                    case nameof(DialogHeight):
                        reader.Read();
                        DialogHeight = reader.GetInt32();
                        break;
                    case nameof(TargetView):
                        reader.Read();
                        TargetView = reader.GetString() ?? string.Empty;
                        break;
                    case nameof(Parameters):
                        ReadParameters(ref reader);
                        break;
                }
            }
        }
    }

    private void ReadParameters(ref Utf8JsonReader reader)
    {
        reader.Read(); // [
        ViewParameter parameter = null!;

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                parameter = new ViewParameter();
                continue;
            }

            if (reader.TokenType == JsonTokenType.EndObject)
            {
                Parameters.Add(parameter);
                continue;
            }

            if (reader.TokenType == JsonTokenType.PropertyName)
            {
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(ViewParameter.StateName):
                        reader.Read();
                        parameter.StateName = reader.GetString() ?? string.Empty;
                        break;
                    case "SourceType":
                        reader.Read();
                        var sourceType = reader.GetString() ?? string.Empty;
                        parameter.Source = CreateParameterSource(sourceType);
                        parameter.Source.ReadProperties(ref reader);
                        break;
                }
            }
        }
    }

    private static IViewParameterSource CreateParameterSource(string sourceTypeName) => sourceTypeName switch
    {
        FetchRowParameter.SourceName => new FetchRowParameter(),
        _ => throw new Exception("Unknown source type: " + sourceTypeName)
    };

    #endregion

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        //var dynamicWidget = new DynamicWidget()
        
        throw new NotImplementedException();
    }
}