using System.Diagnostics;
using System.Text.Json;
using AppBoxCore;
using PixUI.Dynamic;

namespace AppBoxClient.Dynamic.Events;

/// <summary>
/// 新建数据行的视图参数
/// </summary>
public sealed class CreateRowParameter : IViewParameterSource
{
    internal const string SourceName = "CreateRow";

    public string Name => SourceName;

    public List<FieldDefaultValue> DefaultValues { get; } = [];

    #region ====Serialization====

    public void WriteProperties(Utf8JsonWriter writer)
    {
        writer.WritePropertyName(nameof(DefaultValues));
        writer.WriteStartArray();
        foreach (var item in DefaultValues)
        {
            writer.WriteStartObject();
            writer.WriteString("Target", item.TargetFieldName);
            writer.WritePropertyName("DefaultValue");
            ExpressionSerialization.SerializeToJson(writer, item.DefaultValue);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    public void ReadProperties(ref Utf8JsonReader reader)
    {
        reader.Read(); // PkValues prop name
        Debug.Assert(reader.TokenType == JsonTokenType.PropertyName && reader.GetString() == nameof(DefaultValues));
        reader.Read(); // [

        FieldDefaultValue defaultValue = null!;
        while (reader.Read())
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.StartObject:
                    defaultValue = new();
                    break;
                case JsonTokenType.PropertyName:
                    var propName = reader.GetString();
                    if (propName == "Target")
                    {
                        reader.Read();
                        defaultValue.TargetFieldName = reader.GetString()!;
                    }
                    else if (propName == "DefaultValue")
                        defaultValue.DefaultValue = ExpressionSerialization.DeserializeFromJson(ref reader);
                    else
                        throw new Exception($"Unknown property: {nameof(CreateRowParameter)}.{propName}");

                    break;
                case JsonTokenType.EndObject:
                    DefaultValues.Add(defaultValue);
                    break;
                case JsonTokenType.EndArray:
                    return;
            }
        }
    }

    #endregion

    public ValueTask Run(IDynamicContext current, IDynamicContext target, string targetName)
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// 新建数据行时的字段默认值
    /// </summary>
    public sealed class FieldDefaultValue
    {
        /// <summary>
        /// 目标字段名称(不需要全路径) eg: CreateTime
        /// </summary>
        public string TargetFieldName { get; set; } = null!;

        /// <summary>
        /// 默认值的表达式 eg: DateTime.Now
        /// </summary>
        public Expression? DefaultValue { get; set; }
    }
}