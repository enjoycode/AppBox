using System.Diagnostics;
using System.Text.Json;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据行
/// </summary>
internal sealed class DynamicRowFromQuery : IDynamicRowSource
{
    public string SourceType => DynamicDataRow.FromQuery;

    public EntityExpression? Root { get; internal set; }

    /// <summary>
    /// 输出的字段
    /// </summary>
    public List<DynamicQuery.SelectItem> Selects { get; } = [];

    public Task<DynamicRow?> GetFetchTask(IDynamicContext dynamicContext)
    {
        if (Expression.IsNull(Root))
            throw new Exception("Query target not set");

        throw new NotImplementedException();
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        if (Expression.IsNull(Root))
            return;

        writer.WriteNumber("ModelId", Root!.ModelId);

        //Selects
        writer.WritePropertyName(nameof(Selects));
        writer.WriteStartArray();
        for (var i = 0; i < Selects.Count; i++)
        {
            Selects[i].WriteTo(writer, Root);
        }

        writer.WriteEndArray();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            var propName = reader.GetString();
            switch (propName)
            {
                case "ModelId":
                    reader.Read();
                    var modelId = reader.GetInt64();
                    Root = new EntityExpression(modelId, null);
                    break;
                case nameof(Selects):
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        Debug.Assert(reader.TokenType == JsonTokenType.StartObject);
                        Selects.Add(DynamicQuery.SelectItem.ReadFrom(ref reader, Root!));
                    }

                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DynamicRowFromQuery)}.{propName}");
            }
        }
    }

    #endregion
}