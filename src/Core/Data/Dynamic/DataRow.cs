namespace AppBoxCore;

/// <summary>
/// 动态数据行
/// </summary>
public sealed class DataRow
{
    private readonly Dictionary<string, DataCell> _fields = new();

    public DataCell this[string name]
    {
        get => _fields[name];
        set
        {
            if (!_fields.TryAdd(name, value))
                _fields[name] = value.WithChanged();
        }
    }

    public bool HasValue(string name) => _fields.TryGetValue(name, out var field) && field.HasValue;

    public void AcceptChanges()
    {
        foreach (var kv in _fields)
        {
            if (kv.Value.HasChanged)
                _fields[kv.Key] = kv.Value.WithoutChange();
        }
    }

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

    #region ====Serialization====

    internal void WriteTo(IOutputStream ws, DataColumn[] fields)
    {
        //注意按fields顺序写入值
        foreach (var field in fields)
        {
            if (_fields.TryGetValue(field.Name, out var value))
                value.WriteTo(ws);
            else
                ws.WriteByte((byte)DataType.Empty);
        }
    }

    internal void ReadFrom(IInputStream rs, DataColumn[] fields)
    {
        foreach (var field in fields)
        {
            _fields[field.Name] = DataCell.ReadFrom(rs);
        }
    }

    #endregion
}