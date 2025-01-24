namespace AppBoxDesign;

/// <summary>
/// 用于区分Staged.Data内存储的数据类型
/// </summary>
public enum StagedType : byte
{
    Model = 0, //模型序列化数据
    Folder, //文件夹
    SourceCode, //服务模型或视图模型的源代码 //TODO:考虑按类型分开
}