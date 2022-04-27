using AppBoxCore.Utils;

namespace AppBoxCore;

[BinSerializable]
public sealed partial class ApplicationModel
{
    [Field(1)] private int _id;
    [Field(2, true)] private int _devModelIdSeq; //仅用于导入导出，注意导出前需要从存储刷新
    [Field(3)] private string _owner;
    [Field(4)] private string _name;
#if FUTURE
    private byte _sysStoreId; //映射至系统存储的编号，由SysStore生成
#endif

    public ApplicationModel(string owner, string name)
    {
        _owner = owner;
        _name = name;
        _id = StringUtil.GetHashCode(owner) ^ StringUtil.GetHashCode(name);
    }

    public int Id => _id;
    public string Name => _name;
}