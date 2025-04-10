namespace AppBoxCore;

/// <summary>
/// 动态数据行
/// </summary>
public sealed class DataRow
{
    private readonly Dictionary<string, DataCell> _fields = new();
    public PersistentState PersistentState { get; private set; } = PersistentState.Detached;

    public DataCell this[string name]
    {
        get => _fields[name];
        set
        {
            if (PersistentState == PersistentState.Detached)
            {
                _fields[name] = value;
            }
            else
            {
                _fields[name] = value.WithChanged();
                if (PersistentState == PersistentState.Unchanged)
                    PersistentState = PersistentState.Modified;
            }
        }
    }

    public bool HasValue(string name) => _fields.TryGetValue(name, out var field) && field.HasValue;

    public bool HasChanged(string name) => _fields.TryGetValue(name, out var field) && field.HasChanged;

    public void AcceptChanges()
    {
        PersistentState = PersistentState == PersistentState.Deleted
            ? PersistentState.Detached
            : PersistentState.Unchanged;

        foreach (var kv in _fields)
        {
            if (kv.Value.HasChanged)
                _fields[kv.Key] = kv.Value.WithoutChange();
        }
    }

    internal void AcceptAfterFetch() => PersistentState = PersistentState.Unchanged;

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
        ws.WriteByte((byte)PersistentState);

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
        PersistentState = (PersistentState)rs.ReadByte();

        foreach (var field in fields)
        {
            _fields[field.Name] = DataCell.ReadFrom(rs);
        }
    }

    #endregion
}