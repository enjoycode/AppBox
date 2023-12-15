using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PixUI.Dynamic;

public enum DynamicStateValueSource
{
    Primitive,
    Expression
}

public sealed class DynamicValueState : IDynamicValueState
{
    [JsonIgnore] private State? _runtimeValue;
    private object? _value;

    public DynamicStateValueSource Source { get; set; }

    /// <summary>
    /// 设计时状态值
    /// </summary>
    public object? Value
    {
        get => _value;
        set
        {
            _value = value;
            _runtimeValue?.NotifyValueChanged();
        }
    }

    public State GetRuntimeValue(DynamicState state)
    {
        if (_runtimeValue != null) return _runtimeValue;

        //暂用RxProxy<>包装Value,考虑入参确定运行时使用RxValue<>
        switch (state.Type)
        {
            case DynamicStateType.String:
                _runtimeValue = new RxProxy<string>(() => (Value as string) ?? string.Empty, v => Value = v);
                break;
            case DynamicStateType.Int:
                _runtimeValue = state.AllowNull
                    ? new RxProxy<int?>(() => (int?)Value, v => Value = v)
                    : new RxProxy<int>(() => Value == null ? default : (int)Value, v => Value = v);
                break;
            case DynamicStateType.DateTime:
                _runtimeValue = state.AllowNull
                    ? new RxProxy<DateTime?>(() => (DateTime?)Value, v => Value = v)
                    : new RxProxy<DateTime>(() => Value == null ? default : (DateTime)Value, v => Value = v);
                break;
            default:
                throw new NotImplementedException();
        }

        return _runtimeValue;
    }

    #region ====Serialization====

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

        var peekReader = reader; // maybe null when not AllowNull, eg: Value: {"Primitive": null}
        peekReader.Read();
        if (peekReader.TokenType != JsonTokenType.Null)
        {
            var valueType = state.GetValueStateValueType();
            Value = JsonSerializer.Deserialize(ref reader, valueType);
        }

        reader.Read(); // }
    }

    #endregion
}