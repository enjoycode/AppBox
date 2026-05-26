namespace AppBoxCore;

public sealed class ApplicationModel : IBinSerializable
{
    private int _id;
    private int _devModelIdSeq; //仅用于导入导出，注意导出前需要从存储刷新
    private string _owner = null!;
    private string _name = null!;
#if FUTURE
    private byte _sysStoreId; //映射至系统存储的编号，由SysStore生成
#endif

    public ApplicationModel() { }

    public ApplicationModel(string owner, string name)
    {
        _owner = owner;
        _name = name;
        _id = StringUtil.GetHashCode(owner) ^ StringUtil.GetHashCode(name);
    }

    public int Id => _id;
    public string Name => _name;

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteInt(_id);
        ws.WriteVariant(_devModelIdSeq);
        ws.WriteString(_owner);
        ws.WriteString(_name);
        ws.WriteFieldEnd();
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        _id = rs.ReadInt();
        _devModelIdSeq = rs.ReadVariant();
        _owner = rs.ReadString() ?? string.Empty;
        _name = rs.ReadString() ?? string.Empty;
        rs.ReadFieldId();
    }
}