using System.Diagnostics;
using System.Text.Json;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 填充数据行的视图参数
/// </summary>
public sealed class FetchRowParameter : IViewParameterSource
{
    internal const string SourceName = "FetchRow";

    public string Name => SourceName;

    public List<PrimaryKeyValue> PkValues { get; } = [];

    #region ====Serialization====

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WritePropertyName(nameof(PkValues));
        writer.WriteStartArray();
        foreach (var pkValue in PkValues)
        {
            writer.WriteStartObject();
            writer.WriteString("Current", pkValue.FromStateName);
            writer.WriteString("Target", pkValue.TargetFieldName);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        reader.Read(); // PkValues prop name
        Debug.Assert(reader.TokenType == JsonTokenType.PropertyName && reader.GetString() == nameof(PkValues));
        reader.Read(); // [

        PrimaryKeyValue pkValue = null!;
        while (reader.Read())
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    pkValue = new();
                    break;
                case JsonTokenType.PropertyName:
                    var propName = reader.GetString();
                    reader.Read();
                    if (propName == "Current")
                        pkValue.FromStateName = reader.GetString()!;
                    else if (propName == "Target")
                        pkValue.TargetFieldName = reader.GetString()!;
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

    #endregion

    public async ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        //1. 复制主键字段的值给目标
        foreach (var pkValue in PkValues)
        {
            var src = current.FindState(pkValue.FromStateName);
            var dst = target.FindState($"{targetName}.{pkValue.TargetFieldName}");
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

    /// <summary>
    /// 填充数据行时的主键的值
    /// </summary>
    public sealed class PrimaryKeyValue
    {
        /// <summary>
        /// 目标字段名称，不需要全路径
        /// </summary>
        public string TargetFieldName { get; set; } = string.Empty;

        /// <summary>
        /// 来源状态名称，即将来源状态值复制给目标状态, eg: orders.Current.OrderId
        /// </summary>
        public string FromStateName { get; set; } = string.Empty;
    }
}