namespace AppBoxCore;

/// <summary>
/// 运行时的工作流参数集
/// </summary>
public sealed class WorkflowParameters : IBinSerializable
{
    public WorkflowParameters() { }

    public WorkflowParameters(string[] names, AnyValue[] values)
    {
        if (names.Length != values.Length)
            throw new ArgumentException("names and values must have the same length");
        for (var i = 0; i < names.Length; i++)
        {
            _values.Add(names[i], values[i]);
        }
    }

    private readonly Dictionary<string, AnyValue> _values = [];

    public bool IsEmpty => _values.Count == 0;

    public bool TryGetValue(string name, out AnyValue value) => _values.TryGetValue(name, out value);

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