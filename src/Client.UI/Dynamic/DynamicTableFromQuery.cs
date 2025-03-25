using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据表
/// </summary>
internal sealed class DynamicTableFromQuery : IDynamicTableSource
{
    public string SourceType => DynamicTableState.FromQuery;

    public EntityExpression? Root { get; internal set; }

    public int PageSize { get; internal set; }

    public int PageIndex { get; internal set; }

    /// <summary>
    /// 查询输出的字段
    /// </summary>
    public DynamicQuery.SelectItem[] Selects { get; internal set; } = null!;

    /// <summary>
    /// 过滤项
    /// </summary>
    public DynamicTableFilter[]? Filters { get; internal set; }

    /// <summary>
    /// 排序项
    /// </summary>
    public DynamicQuery.OrderByItem[]? Orders { get; internal set; }

    public Task<DynamicTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        if (Expression.IsNull(Root))
            throw new Exception("Query target not set");

        var q = new DynamicQuery();
        q.ModelId = Root!.ModelId;
        q.PageIndex = PageIndex;
        q.PageSize = PageSize;
        q.Selects = Selects;
        q.Orders = Orders;

        if (Filters != null)
        {
            Expression? filter = null;
            foreach (var item in Filters)
            {
                var state = dynamicContext.GetState(item.State);
                if (state.BoxedValue != null)
                {
                    var exp = new BinaryExpression(item.Field,
                        new ConstantExpression(state.BoxedValue),
                        item.Operator);
                    filter = Expression.IsNull(filter)
                        ? exp
                        : new BinaryExpression(filter!, exp, BinaryOperatorType.AndAlso);
                }
            }
            q.Filter = filter;
        }

        return Channel.Invoke<DynamicTable>("sys.EntityService.Fetch", [q]);
    }

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
        if (Selects != null!)
        {
            for (var i = 0; i < Selects.Length; i++)
            {
                Selects[i].WriteTo(writer, Root);
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
                Filters[i].WriteTo(writer, Root);
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
                    var selects = new List<DynamicQuery.SelectItem>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        selects.Add(DynamicQuery.SelectItem.ReadFrom(ref reader, Root!));
                    }

                    Selects = selects.ToArray();
                    break;
                case nameof(Filters):
                    reader.Read(); //[
                    var filters = new List<DynamicTableFilter>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        filters.Add(DynamicTableFilter.ReadFrom(ref reader, Root!));
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
                        orders.Add(DynamicQuery.OrderByItem.ReadFrom(ref reader, Root!));
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
    private DynamicTableFilter(Expression field, BinaryOperatorType operatorType, string state)
    {
        Field = field;
        Operator = operatorType;
        State = state;
    }

    public readonly Expression Field;
    public readonly BinaryOperatorType Operator;
    public readonly string State;

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

    public static DynamicTableFilter ReadFrom(ref Utf8JsonReader reader, EntityExpression root)
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
                    field = ExpressionSerialization.DeserializeFromJson(ref reader, [root])!;
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