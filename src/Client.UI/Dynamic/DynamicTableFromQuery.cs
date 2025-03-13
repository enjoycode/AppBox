using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据表
/// </summary>
internal sealed class DynamicTableFromQuery : IDynamicTableSource
{
    public string SourceType => DynamicTableState.FromQuery;

    /// <summary>
    /// 查询的目标实体模型标识
    /// </summary>
    public ModelId EntityModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; } = -1;

    /// <summary>
    /// 查询输出的字段
    /// </summary>
    public Expression[] Fields { get; set; } = null!;

    /// <summary>
    /// 过滤项
    /// </summary>
    public DynamicTableFilter[]? Filters { get; set; }

    /// <summary>
    /// 排序项
    /// </summary>
    public DynamicQuery.OrderByItem[]? Orders { get; set; }

    public Task<DynamicTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        throw new NotImplementedException();
    }

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteNumber(nameof(EntityModelId), EntityModelId.Value);
        writer.WriteNumber(nameof(PageSize), PageSize);
        writer.WriteNumber(nameof(PageIndex), PageIndex);

        //Fields
        writer.WritePropertyName(nameof(Fields));
        writer.WriteStartArray();
        if (Fields != null!)
        {
            for (var i = 0; i < Fields.Length; i++)
            {
                ExpressionSerialization.SerializeToJson(writer, Fields[i]);
            }
        }

        writer.WriteEndArray();

        //Filters
        if (Filters != null && Filters.Length > 0)
        {
            writer.WritePropertyName(nameof(Filters));
            writer.WriteStartArray();
            for (var i = 0; i < Filters.Length; i++)
            {
                Filters[i].WriteTo(writer);
            }

            writer.WriteEndArray();
        }

        //Orders
        if (Orders != null && Orders.Length > 0)
        {
            writer.WritePropertyName(nameof(Orders));
            writer.WriteStartArray();
            for (var i = 0; i < Orders.Length; i++)
            {
                Orders[i].WriteTo(writer);
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
                case nameof(EntityModelId):
                    reader.Read();
                    EntityModelId = reader.GetInt64();
                    break;
                case nameof(PageSize):
                    reader.Read();
                    PageSize = reader.GetInt32();
                    break;
                case nameof(PageIndex):
                    reader.Read();
                    PageIndex = reader.GetInt32();
                    break;
                case nameof(Fields):
                    reader.Read(); //[
                    var fields = new List<Expression>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        fields.Add(ExpressionSerialization.DeserializeFromJson(ref reader)!);
                    }

                    Fields = fields.ToArray();
                    break;
                case nameof(Filters):
                    reader.Read(); //[
                    var filters = new List<DynamicTableFilter>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        filters.Add(DynamicTableFilter.ReadFrom(ref reader));
                    }

                    Filters = filters.ToArray();
                    break;
                case nameof(Orders):
                    reader.Read(); //[
                    var orders = new List<DynamicQuery.OrderByItem>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        orders.Add(DynamicQuery.OrderByItem.ReadFrom(ref reader));
                    }

                    Orders = orders.ToArray();
                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DynamicTableFromQuery)}.{propName}");
            }
        }
    }

    #endregion
}

internal readonly struct DynamicTableFilter
{
    public DynamicTableFilter(Expression field, BinaryOperatorType operatorType, string state)
    {
        Field = field;
        Operator = operatorType;
        State = state;
    }

    public readonly Expression Field;
    public readonly BinaryOperatorType Operator;
    public readonly string State;

    #region ====Serialization=====

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        writer.WritePropertyName(nameof(Field));
        ExpressionSerialization.SerializeToJson(writer, Field);
        writer.WritePropertyName(nameof(Operator));
        writer.WriteStringValue(Operator.ToString());
        writer.WritePropertyName(nameof(State));
        writer.WriteStringValue(State);
        writer.WriteEndObject();
    }

    public static DynamicTableFilter ReadFrom(ref Utf8JsonReader reader)
    {
        Expression field = null!;
        BinaryOperatorType op = BinaryOperatorType.Equal;
        string state = string.Empty;

        reader.Read(); //{
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;
            var propName = reader.GetString();
            switch (propName)
            {
                case nameof(Field):
                    field = ExpressionSerialization.DeserializeFromJson(ref reader)!;
                    break;
                case nameof(Operator):
                    reader.Read();
                    op = Enum.Parse<BinaryOperatorType>(reader.GetString()!);
                    break;
                case nameof(State):
                    reader.Read();
                    state = reader.GetString()!;
                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DynamicTableFilter)}.{propName}");
            }
        }

        return new DynamicTableFilter(field, op, state);
    }

    #endregion
}