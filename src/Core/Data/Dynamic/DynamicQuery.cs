using System.Text.Json;

namespace AppBoxCore;

public sealed class DynamicQuery : IBinSerializable
{
    //考虑支持手工多表联查

    public ModelId ModelId { get; set; }

    public int PageSize { get; set; }

    public int PageIndex { get; set; }

    public SelectItem[] Selects { get; set; } = null!;

    public Expression? Filter { get; set; }

    public OrderByItem[]? Orders { get; set; }

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        throw new NotImplementedException();
    }

    public void ReadFrom(IInputStream rs)
    {
        throw new NotImplementedException();
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

        public void WriteTo(Utf8JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WritePropertyName(nameof(Field));
            ExpressionSerialization.SerializeToJson(writer, Field);
            writer.WritePropertyName(nameof(Descending));
            writer.WriteBooleanValue(Descending);
            writer.WriteEndObject();
        }

        public static OrderByItem ReadFrom(ref Utf8JsonReader reader)
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