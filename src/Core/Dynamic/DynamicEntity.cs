namespace AppBoxCore;

public sealed class DynamicEntity
{
    private readonly Dictionary<string, DynamicField> _properties = new();

    public DynamicField this[string name]
    {
        get => _properties[name];
        set => _properties[name] = value; //TODO:变更标记
    }

    public override string ToString()
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append('{');
        var needSep = false;
        foreach (var kv in _properties)
        {
            if (needSep) sb.Append(", ");
            else needSep = true;
            sb.Append('"');
            sb.Append(kv.Key);
            sb.Append('"');
            sb.Append(": ");
            sb.Append(kv.Value.ToString());
        }
        sb.Append('}');
        return StringBuilderCache.GetStringAndRelease(sb);
    }

    internal void WriteTo(IOutputStream ws, DynamicFieldInfo[] fields)
    {
        //注意按fields顺序写入值
        foreach (var field in fields)
        {
            if (_properties.TryGetValue(field.Name, out var value))
                value.WriteTo(ws);
            else
                ws.WriteByte((byte)DynamicFieldFlag.Empty);
        }
    }

    internal void ReadFrom(IInputStream rs, DynamicFieldInfo[] fields)
    {
        foreach (var field in fields)
        {
            _properties[field.Name] = DynamicField.ReadFrom(rs);
        }
    }
}