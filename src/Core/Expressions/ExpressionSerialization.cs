using System.Text.Json;

namespace AppBoxCore;

public static class ExpressionSerialization
{
    internal static void WriteExpressionArray(this IOutputStream writer, Expression[]? array)
    {
        if (array is { Length: > 0 })
        {
            writer.WriteVariant(array.Length);
            for (var i = 0; i < array.Length; i++)
            {
                writer.SerializeExpression(array[i]);
            }
        }
        else
        {
            writer.WriteVariant(0);
        }
    }

    internal static void WriteTypeExpressionArray(this IOutputStream writer, TypeExpression[]? array)
    {
        if (array is { Length: > 0 })
        {
            writer.WriteVariant(array.Length);
            for (var i = 0; i < array.Length; i++)
            {
                array[i].WriteTo(writer);
            }
        }
        else
        {
            writer.WriteVariant(0);
        }
    }

    internal static Expression[]? ReadExpressionArray(this IInputStream reader)
    {
        var count = reader.ReadVariant();
        if (count <= 0) return null;

        var res = new Expression[count];
        for (var i = 0; i < count; i++)
        {
            res[i] = (Expression)reader.Deserialize()!;
        }

        return res;
    }

    internal static TypeExpression[]? ReadTypeExpressionArray(this IInputStream reader)
    {
        var count = reader.ReadVariant();
        if (count <= 0) return null;

        var res = new TypeExpression[count];
        for (var i = 0; i < count; i++)
        {
            var item = new TypeExpression();
            item.ReadFrom(reader);
            res[i] = item;
        }

        return res;
    }

    public static void SerializeToJson(Utf8JsonWriter jsonWriter, Expression? expression)
    {
        using var ms = new MemoryWriteStream();
        ms.SerializeExpression(expression);
        var bytes = ms.Data;
        jsonWriter.WriteBase64StringValue(bytes);
    }

    public static Expression? DeserializeFromJson(ref Utf8JsonReader jsonReader)
    {
        jsonReader.Read();
        var bytes = jsonReader.GetBytesFromBase64();
        using var ms = new MemoryReadStream(bytes);
        var res = ms.Deserialize() as Expression;
        return res;
    }
}