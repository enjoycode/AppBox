using System.Diagnostics;
using System.Text.Json;
using AppBoxClient;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据行
/// </summary>
internal sealed class DynamicRowFromQuery : IDynamicRowSource
{
    private readonly DynamicRow _row = new();
    private List<DynamicState>? _childStates;

    public string SourceType => DynamicDataRow.FromQuery;

    public EntityExpression? Root { get; internal set; }

    /// <summary>
    /// 输出的字段
    /// </summary>
    public List<DynamicQuery.SelectItem> Selects { get; } = [];

    /// <summary>
    /// 目标实体的主键字段
    /// </summary>
    internal PrimaryKey[] PrimaryKeys { get; set; } = [];

    #region ====Child States====

    public IEnumerable<DynamicState> GetChildStates(DynamicState parent)
    {
        if (_childStates == null)
        {
            _childStates = new List<DynamicState>();
            foreach (var selectItem in Selects)
            {
                var state = MakeChildDynamicState(parent.Name, selectItem.Alias, selectItem.Type);
                _childStates.Add(state);
            }

            foreach (var pk in PrimaryKeys)
            {
                if (_childStates.Any(item => item.Name == $"{parent.Name}.{pk.Name}"))
                    continue;
                var state = MakeChildDynamicState(parent.Name, pk.Name, pk.Type);
                _childStates.Add(state);
            }
        }

        return _childStates;
    }

    private DynamicState MakeChildDynamicState(string parentName, string childName, DynamicFieldFlag flag)
    {
        var state = new DynamicState() { Name = $"{parentName}.{childName}" };
        state.Type = FieldFlagToStateType(flag);
        //TODO: fix state.AllowNull
        state.Value = new DataCellProxy(_row, childName);
        return state;
    }

    private static DynamicStateType FieldFlagToStateType(DynamicFieldFlag flag) =>
        (flag & DynamicFieldFlag.TypeMask) switch
        {
            DynamicFieldFlag.String => DynamicStateType.String,
            DynamicFieldFlag.Int => DynamicStateType.Int,
            DynamicFieldFlag.DateTime => DynamicStateType.DateTime,
            DynamicFieldFlag.Float => DynamicStateType.Float,
            DynamicFieldFlag.Double => DynamicStateType.Double,
            _ => throw new NotImplementedException(),
        };

    internal void ClearChildStates() => _childStates = null;

    internal void AddChildState(DynamicState parent, string childName, DynamicFieldFlag flag)
    {
        if (_childStates == null) return;

        var state = MakeChildDynamicState(parent.Name, childName, flag);
        _childStates.Add(state);
    }

    internal void RemoveChildState(DynamicState parent, string childName)
    {
        if (_childStates == null) return;
        _childStates.RemoveAll(item => item.Name == $"{parent.Name}.{childName}");
    }

    #endregion

    public Task<DynamicTable?> GetFetchTask(IDynamicContext dynamicContext)
    {
        if (Expression.IsNull(Root))
            throw new Exception("Query target not set");

        var q = new DynamicQuery();
        q.ModelId = Root!.ModelId;
        q.PageSize = 1;
        q.Selects = Selects.ToArray();

        for (var i = 0; i < PrimaryKeys.Length; i++)
        {
            var pk = PrimaryKeys[i];
            if (!_row.HasValue(pk.Name))
                throw new Exception($"Must set pk value: {pk.Name}");
            var exp = new BinaryExpression(Root![pk.Name],
                new ConstantExpression(_row[pk.Name].BoxedValue),
                BinaryOperatorType.Equal);
            q.Filter = i == 0 ? exp : new BinaryExpression(q.Filter!, exp, BinaryOperatorType.AndAlso);
        }

        return Channel.Invoke<DynamicTable>("sys.EntityService.Fetch", [q]);
    }

    #region ====DataCellProxy====

    private sealed class DataCellProxy : IDynamicPrimitive
    {
        public DataCellProxy(DynamicRow row, string name)
        {
            _row = row;
            _name = name;
        }

        private readonly DynamicRow _row;
        private readonly string _name;
        private State? _runtimeState;

        public void WriteTo(Utf8JsonWriter writer) => throw new NotSupportedException();

        public void ReadFrom(ref Utf8JsonReader reader, DynamicState state) => throw new NotSupportedException();

        public object? GetDesignValue(IDynamicContext ctx)
        {
            return _row.HasValue(_name) ? _row[_name].BoxedValue : null;
        }

        public State GetRuntimeState(IDynamicContext ctx, DynamicState state)
        {
            if (_runtimeState != null) return _runtimeState;

            _runtimeState = state.Type switch
            {
                DynamicStateType.String => new RxProxy<string>(
                    () => _row.HasValue(_name) ? _row[_name].StringValue! : string.Empty,
                    v =>
                    {
                        _row[_name] = v;
                        _runtimeState?.NotifyValueChanged();
                    }),
                DynamicStateType.Int => (state.AllowNull
                    ? new RxProxy<int?>(
                        () => _row.HasValue(_name) ? _row[_name].NullableIntValue : null,
                        v =>
                        {
                            _row[_name] = v;
                            _runtimeState?.NotifyValueChanged();
                        })
                    : new RxProxy<int>(
                        () => _row.HasValue(_name) ? _row[_name].IntValue : 0,
                        v =>
                        {
                            _row[_name] = v;
                            _runtimeState?.NotifyValueChanged();
                        })),
                DynamicStateType.DateTime => (state.AllowNull
                    ? new RxProxy<DateTime?>(
                        () => _row.HasValue(_name) ? _row[_name].NullableDateTimeValue : null,
                        v =>
                        {
                            _row[_name] = v;
                            _runtimeState?.NotifyValueChanged();
                        })
                    : new RxProxy<DateTime>(
                        () => _row.HasValue(_name) ? _row[_name].DateTimeValue : default,
                        v =>
                        {
                            _row[_name] = v;
                            _runtimeState?.NotifyValueChanged();
                        })),
                //TODO: others
                _ => throw new NotImplementedException()
            };

            return _runtimeState;
        }
    }

    #endregion

    #region ====Serialization====

    public void WriteTo(Utf8JsonWriter writer)
    {
        if (Expression.IsNull(Root))
            return;

        writer.WriteNumber("ModelId", Root!.ModelId);

        //Selects
        writer.WritePropertyName(nameof(Selects));
        writer.WriteStartArray();
        for (var i = 0; i < Selects.Count; i++)
        {
            Selects[i].WriteTo(writer, Root);
        }

        writer.WriteEndArray();

        //PrimaryKeys
        writer.WritePropertyName(nameof(PrimaryKeys));
        writer.WriteStartArray();
        for (var i = 0; i < PrimaryKeys.Length; i++)
        {
            PrimaryKeys[i].WriteTo(writer);
        }

        writer.WriteEndArray();
    }

    public void ReadFrom(ref Utf8JsonReader reader)
    {
        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndObject)
                break;

            var propName = reader.GetString();
            switch (propName)
            {
                case "ModelId":
                    reader.Read();
                    var modelId = reader.GetInt64();
                    Root = new EntityExpression(modelId, null);
                    break;
                case nameof(Selects):
                    reader.Read(); //[
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        Debug.Assert(reader.TokenType == JsonTokenType.StartObject);
                        Selects.Add(DynamicQuery.SelectItem.ReadFrom(ref reader, Root!));
                    }

                    break;
                case nameof(PrimaryKeys):
                    reader.Read(); //[
                    var list = new List<PrimaryKey>();
                    while (reader.Read())
                    {
                        if (reader.TokenType == JsonTokenType.EndArray)
                            break;
                        list.Add(PrimaryKey.ReadFrom(ref reader));
                    }

                    PrimaryKeys = list.ToArray();

                    break;
                default:
                    throw new Exception($"Unknown property name: {nameof(DynamicRowFromQuery)}.{propName}");
            }
        }
    }

    #endregion

    #region ====PrimaryKey====

    internal readonly struct PrimaryKey
    {
        public PrimaryKey(string name, DynamicFieldFlag type)
        {
            Name = name;
            Type = type;
        }

        public readonly string Name;
        public readonly DynamicFieldFlag Type;

        internal void WriteTo(Utf8JsonWriter writer)
        {
            writer.WriteStartObject();
            writer.WriteString(nameof(Name), Name);
            writer.WriteString(nameof(Type), Type.ToString());
            writer.WriteEndObject();
        }

        internal static PrimaryKey ReadFrom(ref Utf8JsonReader reader)
        {
            var name = string.Empty;
            var type = DynamicFieldFlag.Empty;

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                    break;
                Debug.Assert(reader.TokenType == JsonTokenType.PropertyName);
                var propName = reader.GetString();
                switch (propName)
                {
                    case nameof(Name):
                        reader.Read();
                        name = reader.GetString()!;
                        break;
                    case nameof(Type):
                        reader.Read();
                        type = Enum.Parse<DynamicFieldFlag>(reader.GetString()!);
                        break;
                    default:
                        throw new Exception($"Unknown property name: {nameof(PrimaryKey)}.{propName}");
                }
            }

            return new PrimaryKey(name, type);
        }
    }

    #endregion
}