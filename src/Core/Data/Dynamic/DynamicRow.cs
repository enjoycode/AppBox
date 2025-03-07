namespace AppBoxCore;

/// <summary>
/// 动态数据行
/// </summary>
public sealed class DynamicRow
{
    private readonly Dictionary<string, DynamicField> _fields = new();

    public DynamicField this[string name]
    {
        get => _fields[name];
        set => _fields[name] = value; //TODO:变更标记
    }

    public bool HasValue(string name) => _fields.ContainsKey(name) && _fields[name].HasValue;

    public override string ToString()
    {
        var sb = StringBuilderCache.Acquire();
        sb.Append('{');
        var needSep = false;
        foreach (var kv in _fields)
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
            if (_fields.TryGetValue(field.Name, out var value))
                value.WriteTo(ws);
            else
                ws.WriteByte((byte)DynamicFieldFlag.Empty);
        }
    }

    internal void ReadFrom(IInputStream rs, DynamicFieldInfo[] fields)
    {
        foreach (var field in fields)
        {
            _fields[field.Name] = DynamicField.ReadFrom(rs);
        }
    }
}