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

    public readonly struct SelectItem
    {
        public SelectItem(string alias, Expression item, DynamicFieldFlag type)
        {
            Alias = alias;
            Item = item;
            Type = type;
        }

        public readonly Expression Item;

        public readonly DynamicFieldFlag Type;
        public readonly string Alias;

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
            var type = (DynamicFieldFlag)rs.ReadByte();
            var alias = rs.ReadString()!;
            return new SelectItem(alias, item, type);
        }

        internal void WriteTo(Utf8JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Item));
            ExpressionSerialization.SerializeToJson(writer, Item);
            writer.WriteString(nameof(Type), Type.ToString());
            writer.WriteString(nameof(Alias), Alias);
            writer.WriteEndObject();
        }

        internal static SelectItem ReadFrom(ref Utf8JsonReader reader)
        {
            Expression item = null!;
            DynamicFieldFlag type = DynamicFieldFlag.Empty;
            var alias = string.Empty;

            reader.Read(); //{
            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                    break;
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(Item):
                        item = ExpressionSerialization.DeserializeFromJson(ref reader)!;
                        break;
                    case nameof(Type):
                        reader.Read();
                        type = Enum.Parse<DynamicFieldFlag>(reader.GetString()!);
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

    public readonly struct OrderByItem
    {
        public OrderByItem(Expression field, bool descending = false)
        {
            Field = field;
            Descending = descending;
        }

        public readonly Expression Field;
        public readonly bool Descending;

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

        internal void WriteTo(Utf8JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Field));
            ExpressionSerialization.SerializeToJson(writer, Field);
            writer.WritePropertyName(nameof(Descending));
            writer.WriteBooleanValue(Descending);
            writer.WriteEndObject();
        }

        internal static OrderByItem ReadFrom(ref Utf8JsonReader reader)
        {
            Expression field = null!;
            bool descending = false;

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