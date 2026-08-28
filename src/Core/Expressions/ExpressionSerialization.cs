namespace AppBoxCore;

public static class ExpressionSerialization
{
    internal static void WriteExpressionArray<T>(this ref T writer, Expression[]? array)
        where T : struct, IOutputStream
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

    internal static void WriteTypeInfoArray<T>(this ref T writer, ExpressionTypeInfo[]? array)
        where T : struct, IOutputStream
    {
        if (array is { Length: > 0 })
        {
            writer.WriteVariant(array.Length);
            for (var i = 0; i < array.Length; i++)
            {
                array[i].WriteTo(ref writer);
            }
        }
        else
        {
            writer.WriteVariant(0);
        }
    }

    internal static Expression[]? ReadExpressionArray<T>(this ref T reader)
        where T : struct, IInputStream
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

    internal static ExpressionTypeInfo[]? ReadTypeInfoArray<T>(this ref T reader)
        where T : struct, IInputStream
    {
        var count = reader.ReadVariant();
        if (count <= 0) return null;

        var res = new ExpressionTypeInfo[count];
        for (var i = 0; i < count; i++)
        {
            res[i] = ExpressionTypeInfo.ReadFrom(ref reader);
        }

        return res;
    }
}