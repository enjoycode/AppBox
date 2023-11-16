namespace AppBoxCore;

/// <summary>
/// 模型的文件夹，每个应用的模型类型对应一个根文件夹
/// 修改时签出对应的模型根节点
/// </summary>
public sealed class ModelFolder : IBinSerializable
{
    #region ====Fields & Properties====

    /// <summary>
    /// 根文件夹为null
    /// </summary>
    public string? Name { get; set; }

    public ModelFolder? Parent { get; internal set; }

    /// <summary>
    /// 应用标识号，仅根文件夹存储值
    /// </summary>
    public int AppId
    {
        get => Parent?.AppId ?? _appId;
        private set => _appId = value;
    }

    public ModelType TargetModelType { get; private set; }

    /// <summary>
    /// 根文件夹为Guid.Empty
    /// </summary>
    public Guid Id { get; private set; }

    public int SortNum { get; set; }

    public int Version { get; internal set; } //TODO: remove?

    private List<ModelFolder>? _children;
    private int _appId;

    public List<ModelFolder> Children
    {
        get
        {
            _children ??= new List<ModelFolder>();
            return _children;
        }
    }

    public bool HasChilds => _children != null && _children.Count > 0;

    /// <summary>
    /// 仅Root有效
    /// </summary>
    public bool IsDeleted { get; internal set; }

    #endregion

    #region ====Ctor====

    /// <summary>
    /// Ctor for Serialization
    /// </summary>
    internal ModelFolder() { }

    /// <summary>
    /// Create root folder
    /// </summary>
    public ModelFolder(int appID, ModelType targetModelType)
    {
        //RootFolder Id = Guid.Empty & Name = null
        AppId = appID;
        TargetModelType = targetModelType;
    }

    /// <summary>
    /// Create child folder
    /// </summary>
    public ModelFolder(ModelFolder parent, string name)
    {
        Id = Guid.NewGuid();
        AppId = parent.AppId;
        Parent = parent;
        Name = name;
        TargetModelType = parent.TargetModelType;
        Parent.Children.Add(this);
    }

    #endregion

    #region ====Designtime Methods====

    /// <summary>
    /// 移除文件夹
    /// </summary>
    public void Remove()
    {
        if (Parent == null)
            throw new InvalidOperationException("Can't remove root folder");
        Parent.Children.Remove(this);
    }

    public ModelFolder GetRoot()
    {
        if (Parent != null)
            return Parent.GetRoot();
        return this;
    }

    #endregion

    #region ====Serialization====

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteByte((byte)TargetModelType);
        if (Parent != null)
        {
            ws.WriteGuid(Id);
            ws.WriteString(Name);
            if (TargetModelType == ModelType.Permission) //仅权限文件夹排序
                ws.WriteVariant(SortNum);
        }
        else
        {
            ws.WriteInt(AppId);
            ws.WriteBool(IsDeleted);
        }

        if (!HasChilds)
            ws.WriteVariant(0);
        else
        {
            ws.WriteVariant(_children!.Count);
            foreach (var child in _children)
            {
                child.WriteTo(ws);
            }
        }

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom(IInputStream rs)
    {
        TargetModelType = (ModelType)rs.ReadByte();
        if (Parent != null)
        {
            Id = rs.ReadGuid();
            Name = rs.ReadString()!;
            if (TargetModelType == ModelType.Permission) //仅权限文件夹排序
                SortNum = rs.ReadVariant();
        }
        else
        {
            AppId = rs.ReadInt();
            IsDeleted = rs.ReadBool();
        }

        var childCount = rs.ReadVariant();
        for (var i = 0; i < childCount; i++)
        {
            var child = new ModelFolder { Parent = this };
            child.ReadFrom(rs);
            Children.Add(child);
        }

        rs.ReadVariant(); //保留
    }

    #endregion

    #region ====导入方法====

    // public void Import()
    // {
    //     Version -= 1; //注意：-1，发布时+1
    // }
    //
    // public bool UpdateFrom(ModelFolder from)
    // {
    //     Version = from.Version - 1; //注意：-1，发布时+1
    //     //TODO:暂简单同步处理
    //     Name = from.Name;
    //     _childs = from._childs; //直接复制
    //     return true;
    // }

    #endregion
}