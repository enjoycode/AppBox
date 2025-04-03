using System.Diagnostics;
using System.Text.Json;
using AppBoxClient;
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

    /// <summary>
    /// 目标实体的主键字段
    /// </summary>
    internal List<PrimaryKey> PrimaryKeys { get; set; } = [];

    public Task<DynamicTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        if (Expression.IsNull(Root))
            throw new Exception("Query target not set");

        var q = new DynamicQuery();
        q.ModelId = Root!.ModelId;
        q.PageSize = 1;
        q.Selects = Selects.ToArray();

        for (var i = 0; i < PrimaryKeys.Count; i++)
        {
            var pk = PrimaryKeys[i];
            if (pk.Value == null)
                throw new Exception($"Must set pk value: {pk.Name}");
            var exp = new BinaryExpression(Root![pk.Name], new ConstantExpression(pk.Value!),
                BinaryOperatorType.Equal);
            q.Filter = i == 0 ? exp : new BinaryExpression(q.Filter!, exp, BinaryOperatorType.AndAlso);
        }

        return Channel.Invoke<DynamicTable>("sys.EntityService.Fetch", [q]);
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

        //PrimaryKeys(只需要序列化名称)
        writer.WritePropertyName(nameof(PrimaryKeys));
        writer.WriteStartArray();
        for (var i = 0; i < PrimaryKeys.Count; i++)
        {
            writer.WriteStringValue(PrimaryKeys[i].Name);
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
                case nameof(PrimaryKeys):
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        PrimaryKeys.Add(new PrimaryKey() { Name = reader.GetString()! });
                    }

                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DynamicRowFromQuery)}.{propName}");
            }
        }
    }

    #endregion

    internal sealed class PrimaryKey
    {
        public string Name { get; init; } = null!;
        public object? Value { get; set; }
    }
}