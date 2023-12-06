using System;
using System.Text.Json;

namespace PixUI.Dynamic;

public enum DynamicStateValueSource
{
    Primitive,
    Expression
}

public sealed class DynamicValueState : IDynamicValueState
{
    public DynamicStateValueSource Source { get; set; }
    public object? Value { get; set; }

    public void WriteTo(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();

        var propName = Source switch
        {
            DynamicStateValueSource.Primitive => nameof(DynamicStateValueSource.Primitive),
            DynamicStateValueSource.Expression => nameof(DynamicStateValueSource.Expression),
            _ => throw new JsonException($"Unknown DynamicStateValueSource")
        };
        writer.WritePropertyName(propName);

        if (Source == DynamicStateValueSource.Expression)
            throw new NotImplementedException();

        JsonSerializer.Serialize(writer, Value);
        writer.WriteEndObject();
    }

    public void ReadFrom(ref Utf8JsonReader reader, DynamicState state)
    {
        reader.Read(); // {
        reader.Read(); // Source
        var sourceName = reader.GetString()!;
        Source = sourceName switch
        {
            nameof(DynamicStateValueSource.Primitive) => DynamicStateValueSource.Primitive,
            nameof(DynamicStateValueSource.Expression) => DynamicStateValueSource.Expression,
            _ => throw new JsonException($"Unknown ValueSource: [{sourceName}]")
        };

        if (Source == DynamicStateValueSource.Expression)
            throw new NotImplementedException();

        var valueType = state.Type switch
        {
            DynamicStateType.Int => typeof(int),
            DynamicStateType.String => typeof(string),
            DynamicStateType.DateTime => typeof(DateTime),
            _ => throw new NotImplementedException()
        };
        if (state.AllowNull && state.Type != DynamicStateType.String)
            valueType = typeof(Nullable<>).MakeGenericType(valueType);

        Value = JsonSerializer.Deserialize(ref reader, valueType);
        reader.Read(); // }
    }

    public object? GetRuntimeValue()
    {
        throw new NotImplementedException();
    }
}