using AppBoxCore.Utils;

namespace AppBoxCore;

public enum DataStoreKind : byte
{
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

    internal DataStoreModel() { }

    public DataStoreModel(DataStoreKind kind, string provider, string storeName)
    {
        _id = StringUtil.GetHashCode(storeName);
        _name = storeName;
        _kind = kind;
        _provider = provider;
    }

    public long Id => _id;
    public string Name => _name;
    public DataStoreKind Kind => _kind;
    public string? Provider => _provider;
    public string? Settings => _settings;

    /// <summary>
    /// 是否系统内置的BlobStore
    /// </summary>
    public bool IsSystemBlobStore => _kind == DataStoreKind.Blob && Provider == null;

    public void UpdateSettings(string? settings) => _settings = settings;
}