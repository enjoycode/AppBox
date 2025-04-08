using System.Diagnostics;
using System.Text.Json;

namespace AppBoxCore;

public sealed class DynamicQuery : IBinSerializable
{
    //考虑支持手工多表联查(Joins属性)

    public ModelId ModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; }

    public SelectItem[] Selects { get; set; } = null!;

    public Expression? Filter { get; set; }

    public OrderByItem[]? Orders { get; set; }

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteLong(ModelId);
        ws.WriteInt(PageSize);
        ws.WriteInt(PageIndex);

        ws.SerializeExpression(Filter);

        ws.WriteVariant(Selects.Length);
        for (var i = 0; i < Selects.Length; i++)
        {
            Selects[i].WriteTo(ws);
        }

        ws.WriteVariant(Orders?.Length ?? 0);
        if (Orders != null)
        {
            for (var i = 0; i < Orders.Length; i++)
            {
                Orders[i].WriteTo(ws);
            }
        }
    }

    public void ReadFrom(IInputStream rs)
    {
        ModelId = rs.ReadLong();
        PageSize = rs.ReadInt();
        PageIndex = rs.ReadInt();

        Filter = (Expression?)rs.Deserialize();

        var count = rs.ReadVariant();
        Selects = new SelectItem[count];
        for (var i = 0; i < count; i++)
        {
            Selects[i] = SelectItem.ReadFrom(rs);
        }

        count = rs.ReadVariant();
        if (count > 0)
        {
            Orders = new OrderByItem[count];
            for (var i = 0; i < count; i++)
            {
                Orders[i] = OrderByItem.ReadFrom(rs);
            }
        }
    }

    #endregion

    public sealed class SelectItem
    {
        public SelectItem(string alias, Expression item, DataType type)
        {
            Alias = alias;
            Item = item;
            Type = type;
        }

        public Expression Item { get; internal init; }
        public DataType Type { get; internal init; }
        public string Alias { get; internal init; }

        #region ====Serialization====

        internal void WriteTo(IOutputStream ws)
        {
            ws.SerializeExpression(Item);
            ws.WriteByte((byte)Type);
            ws.WriteString(Alias);
        }

        internal static SelectItem ReadFrom(IInputStream rs)
        {
            var item = (Expression)rs.Deserialize()!;
            var type = (DataType)rs.ReadByte();
            var alias = rs.ReadString()!;
            return new SelectItem(alias, item, type);
        }

        internal void WriteTo(Utf8JsonWriter writer, EntityExpression root)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Item));
            ExpressionSerialization.SerializeToJson(writer, Item, [root]);
            writer.WriteString(nameof(Type), Type.ToString());
            writer.WriteString(nameof(Alias), Alias);
            writer.WriteEndObject();
        }

        internal static SelectItem ReadFrom(ref Utf8JsonReader reader, EntityExpression root)
        {
            Expression item = null!;
            var type = DataType.Empty;
            var alias = string.Empty;

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                    break;
                Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(Item):
                        item = ExpressionSerialization.DeserializeFromJson(ref reader, [root])!;
                        break;
                    case nameof(Type):
                        reader.Read();
                        type = Enum.Parse<DataType>(reader.GetString()!);
                        break;
                    case nameof(Alias):
                        reader.Read();
                        alias = reader.GetString()!;
                        break;
                    default:
                        throw new Exception($"Unknown property name: {nameof(OrderByItem)}.{propName}");
                }
            }

            return new SelectItem(alias, item, type);
        }

        #endregion
    }

    public sealed class OrderByItem
    {
        public OrderByItem(Expression field, bool descending = false)
        {
            Field = field;
            Descending = descending;
        }

        public Expression Field { get; internal init; }
        public bool Descending { get; internal set; }

        #region ====Serialization====

        internal void WriteTo(IOutputStream ws)
        {
            ws.SerializeExpression(Field);
            ws.WriteBool(Descending);
        }

        internal static OrderByItem ReadFrom(IInputStream rs)
        {
            var field = (Expression)rs.Deserialize()!;
            var descending = rs.ReadBool();
            return new OrderByItem(field, descending);
        }

        internal void WriteTo(Utf8JsonWriter writer, EntityExpression root)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Field));
            ExpressionSerialization.SerializeToJson(writer, Field, [root]);
            writer.WritePropertyName(nameof(Descending));
            writer.WriteBooleanValue(Descending);
            writer.WriteEndObject();
        }

        internal static OrderByItem ReadFrom(ref Utf8JsonReader reader, EntityExpression root)
        {
            Expression field = null!;
            var descending = false;

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                    break;
                Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(Field):
                        field = ExpressionSerialization.DeserializeFromJson(ref reader, [root])!;
                        break;
                    case nameof(Descending):
                        reader.Read();
                        descending = reader.GetBoolean();
                        break;
                    default:
                        throw new Exception($"Unknown property name: {nameof(OrderByItem)}.{propName}");
                }
            }

            return new OrderByItem(field, descending);
        }

        #endregion
    }
}