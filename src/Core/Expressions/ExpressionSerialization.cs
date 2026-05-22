using System.Diagnostics;
using System.Reflection;
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

    internal static void WriteTypeInfoArray(this IOutputStream writer, ExpressionTypeInfo[]? array)
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

    internal static ExpressionTypeInfo[]? ReadTypeInfoArray(this IInputStream reader)
    {
        var count = reader.ReadVariant();
        if (count <= 0) return null;

        var res = new ExpressionTypeInfo[count];
        for (var i = 0; i < count; i++)
        {
            res[i] = ExpressionTypeInfo.ReadFrom(reader);
        }

        return res;
    }

    /// <summary>
    /// 将表达式序列化转换为Base64
    /// </summary>
    public static void SerializeToJson(Utf8JsonWriter jsonWriter, Expression? expression,
        IEnumerable<object>? serialized = null)
    {
        using var ms = new MemoryStream();
        var writer = new SystemWriteStream(ms);
        if (serialized is not null)
        {
            foreach (var obj in serialized)
                writer.Context.AddToSerialized(obj);
        }

        writer.SerializeExpression(expression);
        jsonWriter.WriteBase64StringValue(ms.GetBuffer().AsSpan(0, (int)ms.Length));
    }

    /// <summary>
    /// 从Base64内反序列化表达式
    /// </summary>
    public static Expression? DeserializeFromJson(ref Utf8JsonReader jsonReader,
        IEnumerable<object>? deserialized = null)
    {
        jsonReader.Read();
        Debug.Assert(jsonReader.TokenType == JsonTokenType.String);
        var bytes = jsonReader.GetBytesFromBase64();

        using var ms = new MemoryStream(bytes);
        var reader = new SystemReadStream(ms);
        if (deserialized is not null)
        {
            foreach (var obj in deserialized)
                reader.Context.AddToDeserialized(obj);
        }

        var res = reader.Deserialize() as Expression;
        return res;
    }
}