using System.Text.Json;
using System.Text.Json.Serialization;

namespace AppBoxCore;

/// <summary>
/// 动态数据行
/// </summary>
[JsonConverter(typeof(DataRowJsonConverter))]
public sealed class DataRow
{
    private readonly Dictionary<string, DataCell> _fields = new();
    internal Dictionary<string, DataCell> Fields => _fields;

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

    internal object?[] ToValuesArray(DataTable table)
    {
        var res = new object?[table.Columns.Length];
        for (var i = 0; i < table.Columns.Length; i++)
        {
            res[i] = this[table.Columns[i].Name].BoxedValue;
        }

        return res;
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

public sealed class DataRowJsonConverter : JsonConverter<DataRow>
{
    public override void Write(Utf8JsonWriter writer, DataRow value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();

        writer.WriteNumber(nameof(PersistentState), (int)value.PersistentState);

        foreach (var kv in value.Fields)
        {
            writer.WritePropertyName(kv.Key);
            JsonSerializer.Serialize(writer, kv.Value.BoxedValue, options); //TODO: use DataCell.WriteTo()
        }

        writer.WriteEndObject();
    }

    public override DataRow? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
        // var dataRow = new DataRow();
        // while (reader.Read())
        // {
        //     if (reader.TokenType == JsonTokenType.EndObject)
        //         break;
        //     if (reader.TokenType == JsonTokenType.PropertyName)
        //     {
        //         var propName = reader.GetString();
        //         dataRow.Fields.Add(propName, JsonSerializer.Deserialize());
        //     }
        // }
    }
}