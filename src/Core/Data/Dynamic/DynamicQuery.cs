using System.Diagnostics;
using System.Text.Json;

namespace AppBoxCore;

public sealed class DynamicQuery : IBinSerializable
{
    //考虑支持手工多表联查(Joins属性)

    public ModelId ModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; }

    public SelectItem[] Selects { get; set; } = [];

    public Expression? Filter { get; set; }

    public OrderByItem[] Orders { get; set; } = [];

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteLong(ModelId);
        ws.WriteInt(PageSize);
        ws.WriteInt(PageIndex);

        ws.SerializeExpression(Filter);

        ws.WriteArray(Selects);
        ws.WriteArray(Orders);
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        ModelId = rs.ReadLong();
        PageSize = rs.ReadInt();
        PageIndex = rs.ReadInt();

        Filter = (Expression?)rs.Deserialize();

        Selects = rs.ReadArray<TReader, SelectItem>();
        Orders = rs.ReadArray<TReader, OrderByItem>();
    }

    #endregion

    public sealed class SelectItem : IBinSerializable
    {
        public SelectItem() { }

        public SelectItem(string alias, Expression item, DataType type)
        {
            Alias = alias;
            Item = item;
            Type = type;
        }

        public Expression Item { get; private set; } = null!;
        public DataType Type { get; private set; }
        public string Alias { get; private set; } = string.Empty;

        #region ====Serialization====

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.SerializeExpression(Item);
            ws.WriteByte((byte)Type);
            ws.WriteString(Alias);
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            Item = (Expression)rs.Deserialize()!;
            Type = (DataType)rs.ReadByte();
            Alias = rs.ReadString()!;
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

    public sealed class OrderByItem : IBinSerializable
    {
        public OrderByItem() { }

        public OrderByItem(Expression field, bool descending = false)
        {
            Field = field;
            Descending = descending;
        }

        public Expression Field { get; internal set; } = null!;
        public bool Descending { get; internal set; }

        #region ====Serialization====

        public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.SerializeExpression(Field);
            ws.WriteBool(Descending);
        }

        public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            Field = (Expression)rs.Deserialize()!;
            Descending = rs.ReadBool();
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