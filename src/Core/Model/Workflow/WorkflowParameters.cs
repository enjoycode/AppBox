namespace AppBoxCore;

/// <summary>
/// 运行时的工作流参数集
/// </summary>
public sealed class WorkflowParameters : IBinSerializable
{
    private Dictionary<string, AnyValue> _values = [];

    public bool IsEmpty => _values.Count == 0;

    public T? GetValue<T>(string name) where T : notnull
    {
        if (!_values.TryGetValue(name, out var value))
            throw new KeyNotFoundException(name);

        return value.CastTo<T>();
    }

    public void SetValue<T>(string name, T? value) where T : notnull
    {
        if (!_values.ContainsKey(name))
            throw new KeyNotFoundException(name);
        _values[name] = AnyValue.From(value); //TODO:
    }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteVariant(_values.Count);
        foreach (var pair in _values)
        {
            ws.WriteString(pair.Key);
            pair.Value.SerializeTo(ref ws);
        }

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            var key = rs.ReadString()!;
            var value = AnyValue.DeserializeFrom(ref rs);
            _values[key] = value;
        }

        rs.ReadFieldId(); //保留
    }
}