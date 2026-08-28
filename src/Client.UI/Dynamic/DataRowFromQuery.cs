using AppBoxClient;
using AppBoxClient.Utils;
using AppBoxCore;

namespace PixUI.Dynamic;

/// <summary>
/// 来源于动态查询的数据行
/// </summary>
internal sealed class DataRowFromQuery : IDataRowSource
{
    private readonly DataRow _row = new();
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

    public async Task Fetch(IDynamicContext dynamicContext)
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
            var exp = new BinaryExpression(Root!.F(pk.Name),
                Expression.Constant(_row[pk.Name].BoxedValue),
                BinaryOperatorType.Equal);
            q.Filter = i == 0 ? exp : new BinaryExpression(q.Filter!, exp, BinaryOperatorType.AndAlso);
        }

        var dataTable = await Channel.Invoke<DataTable>("sys.EntityService.Fetch", AnyValue.From(q));
        if (dataTable == null || dataTable.Count != 1)
            throw new Exception("Can't fetch data table");

        var row = dataTable[0];
        foreach (var item in Selects)
        {
            _row[item.Alias] = row[item.Alias];
        }

        _row.AcceptChanges();
        NotifyStateChanged();
    }

    private void NotifyStateChanged()
    {
        if (_childStates == null) return;
        foreach (var childState in _childStates)
            childState.Value?.NotifyStateChanged();
    }

    public DataTable ToDataTable()
    {
        var columns = new DataColumn[Selects.Count];
        for (var i = 0; i < Selects.Count; i++)
            columns[i] = new DataColumn(Selects[i].Alias, Selects[i].Type);
        var dataTable = new DataTable(columns);
        dataTable.EntityModelId = Root!.ModelId;
        dataTable.Add(_row);
        return dataTable;
    }

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

    private DynamicState MakeChildDynamicState(string parentName, string childName, DataType flag)
    {
        var state = new DynamicState() { Name = $"{parentName}.{childName}" };
        state.Type = flag.ToDynamicStateType();
        //state.AllowNull = true; //TODO: fix state.AllowNull
        state.Value = new DataCellProxy(_row, childName);
        return state;
    }

    internal void ClearChildStates() => _childStates = null;

    internal void AddChildState(DynamicState parent, string childName, DataType flag)
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

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.SerializeExpression(Root);
        ws.WriteCollection(Selects);
        ws.WriteVariant(PrimaryKeys.Length);
        foreach (var primaryKey in PrimaryKeys)
        {
            primaryKey.WriteTo(ref ws);
        }
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Root = (EntityExpression?)rs.Deserialize();
        rs.ReadCollection(Selects);
        var count = rs.ReadVariant();
        PrimaryKeys = new PrimaryKey[count];
        for (var i = 0; i < count; i++)
        {
            PrimaryKeys[i] = PrimaryKey.ReadFrom(ref rs);
        }
    }

    #endregion

    #region ====PrimaryKey struct====

    internal readonly struct PrimaryKey
    {
        public PrimaryKey(string name, DataType type)
        {
            Name = name;
            Type = type;
        }

        public readonly string Name;
        public readonly DataType Type;

        internal void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
        {
            ws.WriteString(Name);
            ws.WriteByte((byte)Type);
        }

        internal static PrimaryKey ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
        {
            var name = rs.ReadString()!;
            var type = (DataType)rs.ReadByte();
            return new PrimaryKey(name, type);
        }
    }

    #endregion
}