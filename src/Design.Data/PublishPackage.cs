using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于发布的模型包，支持依赖排序
/// </summary>
public sealed class PublishPackage : IBinSerializable
{
    /// <summary>
    /// 应用标识与名称的字典表
    /// </summary>
    public readonly Dictionary<int, string> Apps = new();

    public readonly List<ModelBase> Models = [];

    /// <summary>
    /// 需要保存或删除的模型根文件夹
    /// </summary>
    public readonly List<ModelFolder> Folders = [];

    /// <summary>
    /// 根据引用依赖关系排序
    /// </summary>
    public void SortAllModels()
    {
        Models.Sort(static (a, b) =>
        {
            //先将标为删除的排在前面
            if (a.PersistentState == PersistentState.Deleted && b.PersistentState != PersistentState.Deleted)
                return -1;
            if (a.PersistentState != PersistentState.Deleted && b.PersistentState == PersistentState.Deleted)
                return 1;
            //后面根据类型及依赖关系排序
            if (a.ModelType != b.ModelType)
                return a.ModelType.CompareTo(b.ModelType);
            if (a.ModelType == ModelType.Entity)
            {
                //注意如果都标为删除需要倒序
                if (a.PersistentState == PersistentState.Deleted)
                    return ((EntityModel)b).CompareTo((EntityModel)a);
                return ((EntityModel)a).CompareTo((EntityModel)b);
            }

            return string.Compare(a.Name, b.Name, StringComparison.Ordinal);
        });
    }

    public void WriteTo(IOutputStream ws)
    {
        ws.WriteVariant(Apps.Count);
        foreach (var kv in Apps)
        {
            ws.WriteInt(kv.Key);
            ws.WriteString(kv.Value);
        }

        ws.WriteVariant(Models.Count);
        ws.WriteCollection(typeof(ModelBase), Models.Count, i => Models[i]);

        ws.WriteVariant(Folders.Count);
        ws.WriteCollection(typeof(ModelFolder), Folders.Count, i => Folders[i]);
    }

    public void ReadFrom(IInputStream rs)
    {
        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Apps.Add(rs.ReadInt(), rs.ReadString()!);
        }

        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Models.Add((ModelBase)rs.Deserialize()!);
        }

        count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Folders.Add((ModelFolder)rs.Deserialize()!);
        }
    }
}