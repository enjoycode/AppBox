using System.Diagnostics;
using System.Text.Json;
using System.Threading.Channels;

namespace AppBoxCore;

/// <summary>
/// 来源于动态查询的数据表，用于动态视图及报表的数据源
/// </summary>
public abstract class DataTableFromQueryBase
{
    public EntityExpression? Root { get; internal set; }

    public int PageSize { get; internal set; }

    public int PageIndex { get; internal set; }

    /// <summary>
    /// 查询输出的字段
    /// </summary>
    public List<DynamicQuery.SelectItem> Selects { get; } = [];

    /// <summary>
    /// 过滤项
    /// </summary>
    public List<FilterItem> Filters { get; } = [];

    /// <summary>
    /// 排序项
    /// </summary>
    public List<DynamicQuery.OrderByItem> Orders { get; } = [];

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        if (Expression.IsNull(Root))
            return;

        writer.WriteNumber("ModelId", Root!.ModelId);
        writer.WriteNumber(nameof(PageSize), PageSize);
        writer.WriteNumber(nameof(PageIndex), PageIndex);

        //Selects
        writer.WritePropertyName(nameof(Selects));
        writer.WriteStartArray();
        for (var i = 0; i < Selects.Count; i++)
        {
            Selects[i].WriteTo(writer, Root);
        }

        writer.WriteEndArray();

        //Filters
        if (Filters.Count > 0)
        {
            writer.WritePropertyName(nameof(Filters));
            writer.WriteStartArray();
            for (var i = 0; i < Filters.Count; i++)
            {
                Filters[i].WriteTo(writer, Root);
            }

            writer.WriteEndArray();
        }

        //Orders
        if (Orders.Count > 0)
        {
            writer.WritePropertyName(nameof(Orders));
            writer.WriteStartArray();
            for (var i = 0; i < Orders.Count; i++)
            {
                Orders[i].WriteTo(writer, Root);
            }

            writer.WriteEndArray();
        }
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
                case nameof(PageSize):
                    reader.Read();
                    PageSize = reader.GetInt32();
                    break;
                case nameof(PageIndex):
                    reader.Read();
                    PageIndex = reader.GetInt32();
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
                case nameof(Filters):
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        Debug.Assert(reader.TokenType == JsonTokenType.StartObject);
                        Filters.Add(FilterItem.ReadFrom(ref reader, Root!));
                    }

                    break;
                case nameof(Orders):
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        Debug.Assert(reader.TokenType == JsonTokenType.StartObject);
                        Orders.Add(DynamicQuery.OrderByItem.ReadFrom(ref reader, Root!));
                    }

                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DataTableFromQueryBase)}.{propName}");
            }
        }
    }

    #endregion

    #region ====FilterItem====

    public sealed class FilterItem
    {
        public Expression Field { get; internal set; } = null!;
        public BinaryOperatorType Operator { get; internal set; }

        /// <summary>
        /// 比较的状态或参数的名称
        /// </summary>
        public string State { get; internal set; } = null!;

        #region ====Serialization=====

        public void WriteTo(Utf8JsonWriter writer, EntityExpression root)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Field));
            ExpressionSerialization.SerializeToJson(writer, Field, [root]);
            writer.WritePropertyName(nameof(Operator));
            writer.WriteStringValue(Operator.ToString());
            writer.WritePropertyName(nameof(State));
            writer.WriteStringValue(State);
            writer.WriteEndObject();
        }

        public static FilterItem ReadFrom(ref Utf8JsonReader reader, EntityExpression root)
        {
            var filter = new FilterItem();

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                    break;
                Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(Field):
                        filter.Field = ExpressionSerialization.DeserializeFromJson(ref reader, [root])!;
                        break;
                    case nameof(Operator):
                        reader.Read();
                        filter.Operator = Enum.Parse<BinaryOperatorType>(reader.GetString()!);
                        break;
                    case nameof(State):
                        reader.Read();
                        filter.State = reader.GetString()!;
                        break;
                    default:
                        throw new Exception($"Unknown property name: {nameof(FilterItem)}.{propName}");
                }
            }

            return filter;
        }

        #endregion
    }

    #endregion
}