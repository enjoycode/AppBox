using System.Diagnostics;
using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 填充数据行的参数类型
/// </summary>
public sealed class FetchRowParameter : IViewParameterSource
{
    internal const string SourceName = "FetchRow";

    public string Name => SourceName;

    public List<PrimaryKeyValue> PkValues { get; } = [];

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WritePropertyName(nameof(PkValues));
        writer.WriteStartArray();
        foreach (var pkValue in PkValues)
        {
            writer.WriteStartObject();
            writer.WriteString("Current", pkValue.CurrentStateName);
            writer.WriteString("Target", pkValue.TargetStateName);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        reader.Read(); // PkValues prop name
        Debug.Assert(reader.TokenType == JsonTokenType.PropertyName && reader.GetString() == nameof(PkValues));
        reader.Read(); // [

        PrimaryKeyValue pkValue = new PrimaryKeyValue();
        while (reader.Read())
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    pkValue = new PrimaryKeyValue();
                    break;
                case JsonTokenType.PropertyName:
                    var propName = reader.GetString();
                    reader.Read();
                    if (propName == "Current")
                        pkValue.CurrentStateName = reader.GetString()!;
                    else if (propName == "Target")
                        pkValue.TargetStateName = reader.GetString()!;
                    else
                        throw new Exception($"Unknown property: {propName}");
                    break;
                case JsonTokenType.EndObject:
                    PkValues.Add(pkValue);
                    break;
                case JsonTokenType.EndArray:
                    return;
            }
        }
    }

    public async ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        //1. 复制主键字段的值给目标
        foreach (var pkValue in PkValues)
        {
            var src = current.FindState(pkValue.CurrentStateName);
            var dst = target.FindState(pkValue.TargetStateName);
            if (src == null || dst == null)
                throw new Exception("Can't find current or target state");
            dst.Value!.CopyFrom(current, src);
        }

        //2. 开始fetch目标DataRow
        var targetState = target.FindState(targetName);
        if (targetState == null)
            throw new Exception($"Target state: {targetName} does not exist");
        if (targetState.Type != DynamicStateType.DataRow)
            throw new Exception($"Target state: {targetName} must be a DataRow");

        var targetDataRow = (DynamicDataRow)targetState.Value!;
        await targetDataRow.Source.Fetch(target);
    }

    public sealed class PrimaryKeyValue
    {
        public string CurrentStateName { get; set; } = string.Empty;
        public string TargetStateName { get; set; } = string.Empty;
    }
}