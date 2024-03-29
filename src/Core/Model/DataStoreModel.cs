namespace AppBoxCore;

public enum DataStoreKind : byte
{
    None = 0,

    /// <summary>
    /// 系统内置存储
    /// </summary>
    Sys,

    /// <summary>
    /// Sql关系数据库
    /// </summary>
    Sql,

    /// <summary>
    /// 对象存储
    /// </summary>
    Blob
}

[BinSerializable(BinSerializePolicy.Compact)]
public sealed partial class DataStoreModel
{
    [Field(1)] private long _id;
    [Field(2)] private string _name = null!;
    [Field(3)] private DataStoreKind _kind;
    [Field(4)] private string? _provider;
    [Field(5)] private string? _settings;
    [Field(6)] private bool _isDbFirst;

    internal DataStoreModel() { }

    public DataStoreModel(DataStoreKind kind, string storeName, string? provider, bool dbFirst = false)
    {
        _id = StringUtil.GetHashCode(storeName);
        _name = storeName;
        _kind = kind;
        _provider = provider;
        _isDbFirst = dbFirst;
    }

    public long Id => _id;
    public string Name => _name;
    public DataStoreKind Kind => _kind;
    public string? Provider => _provider;
    public string? Settings => _settings;
    public bool IsDbFirst => _isDbFirst;

    /// <summary>
    /// 是否系统内置的BlobStore
    /// </summary>
    public bool IsSystemBlobStore => _kind == DataStoreKind.Blob && Provider == null;

    public void UpdateSettings(string? settings) => _settings = settings;
}