using System;
using System.Diagnostics;
using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 调用服务填充数据源
/// </summary>
public sealed class FetchDataSource : IEventAction
{
    public string ActionName => nameof(FetchDataSource);

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
                default: throw new Exception($"Unknown property: FetchDataSource.{propName}");
            }
        }
    }

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        var state = dynamicContext.FindState(DataSource);
        if (state == null)
        {
            Notification.Error($"Can't find DataSource: {DataSource}");
            return;
        }

        if (state.Value is not DynamicDataTable ds)
        {
            Notification.Error($"Value is not a DataSource: {DataSource}");
            return;
        }
        
        ds.Refresh();
    }
}