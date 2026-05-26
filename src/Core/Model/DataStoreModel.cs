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

public sealed class DataStoreModel
{
    private long _id;
    private string _name = null!;
    private DataStoreKind _kind;
    private string? _provider;
    private string? _settings;
    private bool _isDbFirst;

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

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteLong(_id);
        ws.WriteString(_name);
        ws.WriteByte((byte)_kind);
        ws.WriteBool(_isDbFirst);
        if (_provider != null)
        {
            ws.WriteFieldId(4);
            ws.WriteString(_provider);
        }

        if (_settings != null)
        {
            ws.WriteFieldId(5);
            ws.WriteString(_settings);
        }

        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        _id = rs.ReadLong();
        _name = rs.ReadString() ?? string.Empty;
        _kind = (DataStoreKind)rs.ReadByte();
        _isDbFirst = rs.ReadBool();
        while (true)
        {
            var fieldId = rs.ReadFieldId();
            switch (fieldId)
            {
                case 4: _provider = rs.ReadString(); break;
                case 5: _settings = rs.ReadString(); break;
                case 0: return;
                default: throw new SerializationException(SerializationError.ReadUnknownFieldId);
            }
        }
    }
}