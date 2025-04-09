using System.Diagnostics;
using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 填充数据操作
/// </summary>
public sealed class FetchData : IEventAction
{
    public string ActionName => nameof(FetchData);

    /// <summary>
    /// 对应的数据源状态的名称
    /// </summary>
    public string DataSource { get; set; } = null!;

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(DataSource), DataSource);
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
            var propName = reader.GetString();
            reader.Read();
            switch (propName)
            {
                case nameof(DataSource):
                    DataSource = reader.GetString() ?? string.Empty;
                    break;
                default: throw new Exception($"Unknown property: {nameof(FetchData)}.{propName}");
            }
        }
    }

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        var state = dynamicContext.FindState(DataSource);
        if (state == null)
        {
            Notification.Error($"Can't find state: {DataSource}");
            return;
        }

        if (state.Value is not DynamicDataTable ds)
        {
            Notification.Error($"Value is not a DataTable: {DataSource}");
            return;
        }
        
        ds.Refresh();
    }
}