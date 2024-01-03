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
                writer.Serialize(array[i]);
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
}