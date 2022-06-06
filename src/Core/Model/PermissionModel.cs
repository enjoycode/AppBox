namespace AppBoxCore;

public sealed class PermissionModel : ModelBase
{
    public PermissionModel() { }

    public PermissionModel(ModelId id, string name) : base(id, name) { }

    private IList<Guid>? _orgUnits; //授权的组织单元
    private int _sortNum; //用于排序
    private string? _comment; //备注

    public IList<Guid> OrgUnits
    {
        get
        {
            _orgUnits ??= new List<Guid>();
            return _orgUnits;
        }
    }

    public int SortNum
    {
        get => _sortNum;
        set
        {
            _sortNum = value;
            OnPropertyChanged();
        }
    }

    public string? Comment
    {
        get => _comment;
        set
        {
            _comment = value;
            OnPropertyChanged();
        }
    }

    /// <summary>
    /// 指定会话是否具备当前权限
    /// </summary>
    public bool Owns(IUserSession session)
    {
        if (_orgUnits == null || _orgUnits.Count == 0)
            return false;

        foreach (var orgUnit in _orgUnits)
        {
            var startIndex = session.IsExternal ? 1 : 0; //注意:外部会话忽略第0级的External信息
            for (var j = startIndex; j < session.Levels; j++)
            {
                if (session[j].Id == orgUnit)
                    return true;
            }
        }

        return false;
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteVariant(_sortNum);
        ws.WriteString(_comment);
        ws.WriteVariant(_orgUnits?.Count ?? 0);
        if (_orgUnits != null)
        {
            for (var i = 0; i < _orgUnits.Count; i++)
            {
                ws.WriteGuid(_orgUnits[i]);
            }
        }
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        _sortNum = rs.ReadVariant();
        _comment = rs.ReadString();
        var count = rs.ReadVariant();
        if (count > 0)
        {
            _orgUnits = new List<Guid>(count);
            for (var i = 0; i < count; i++)
            {
                _orgUnits.Add(rs.ReadGuid());
            }
        }
    }
}