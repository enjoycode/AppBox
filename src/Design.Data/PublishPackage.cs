using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于发布的模型包，支持依赖排序
/// </summary>
public sealed class PublishPackage : ModelPackage
{
    /// <summary>
    /// 用于删除整个应用时指定删除的应用标识
    /// </summary>
    public int? DeletedAppId { get; set; }

    /// <summary>
    /// 应用标识与名称的字典表
    /// </summary>
    public readonly Dictionary<int, string> Apps = new();

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        ws.WriteBool(DeletedAppId.HasValue);
        if (DeletedAppId.HasValue)
            ws.WriteInt(DeletedAppId.Value);

        ws.WriteVariant(Apps.Count);
        foreach (var kv in Apps)
        {
            ws.WriteInt(kv.Key);
            ws.WriteString(kv.Value);
        }

        base.WriteTo(ref ws);
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        var hasDeletedAppId = rs.ReadBool();
        if (hasDeletedAppId)
            DeletedAppId = rs.ReadInt();

        var count = rs.ReadVariant();
        for (var i = 0; i < count; i++)
        {
            Apps.Add(rs.ReadInt(), rs.ReadString()!);
        }

        base.ReadFrom(ref rs);
    }

    #endregion
}