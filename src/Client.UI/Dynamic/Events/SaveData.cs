using System.Diagnostics;
using System.Text.Json;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 保存数据操作
/// </summary>
public sealed class SaveData : IEventAction
{
    public string ActionName => nameof(SaveData);

    public List<string> DataSources { get; } = [];

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WritePropertyName(nameof(DataSources));
        writer.WriteStartArray();
        foreach (var dataSource in DataSources)
            writer.WriteStringValue(dataSource);
        writer.WriteEndArray();
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
                case nameof(DataSources):
                    DataSources.AddRange(JsonSerializer.Deserialize<string[]>(ref reader)!);
                    break;
                default: throw new Exception($"Unknown property: {nameof(FetchData)}.{propName}");
            }
        }
    }

    public async void Run(IDynamicContext dynamicContext, object? eventArg = null)
    {
        if (DataSources.Count == 0) return;

        var tables = new DataTable[DataSources.Count];
        for (var i = 0; i < DataSources.Count; i++)
        {
            var state = dynamicContext.FindState(DataSources[i]);
            if (state == null)
                throw new Exception($"Can't find state: {DataSources[i]}");

            if (state.Type == DynamicStateType.DataRow)
            {
                var dataRow = (DynamicDataRow)state.Value!;
                tables[i] = dataRow.Source.ToDataTable();
            }
            else if (state.Type == DynamicStateType.DataTable)
            {
                var dataTable = (DynamicDataTable)state.Value!;
                throw new NotImplementedException();
            }
            else
            {
                throw new Exception($"Unknown state type: {state.Type}");
            }
        }

        try
        {
            await Channel.Invoke("sys.EntityService.Save", [tables]);
        }
        catch (Exception e)
        {
            Notification.Error($"Save error: {e.Message}");
        }
    }
}