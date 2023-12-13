using System;
using System.Diagnostics;
using System.Text.Json;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 调用服务填充数据集
/// </summary>
public sealed class FetchDataSet : IEventAction
{
    public string ActionName => nameof(FetchDataSet);

    /// <summary>
    /// 对应的数据集状态的名称
    /// </summary>
    public string DataSet { get; set; } = null!;

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WriteString(nameof(DataSet), DataSet);
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
                case nameof(DataSet):
                    DataSet = reader.GetString() ?? string.Empty;
                    break;
                default: throw new Exception($"Unknown property: FetchDataSet.{propName}");
            }
        }
    }

    public void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        var state = dynamicContext.FindState(DataSet);
        if (state == null)
        {
            Notification.Error($"Can't find DataSet: {DataSet}");
            return;
        }

        if (state.Value is not DynamicDataSetState ds)
        {
            Notification.Error($"Value is not a DataSet: {DataSet}");
            return;
        }
        
        ds.Reset();
    }
}