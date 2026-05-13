namespace AppBoxCore;

public abstract class ActivityModel : IBinSerializable
{
    //TODO:加入Name属性

    public abstract byte Type { get; }

    public string Title { get; set; } = string.Empty;

    public float X { get; set; }
    public float Y { get; set; }

    /// <summary>
    /// 获取源自本身的连接至其他节点的FlowLink数组
    /// </summary>
    public virtual FlowLink[]? GetOutLinks() => null;

    /// <summary>
    /// 获取源自本身的可供连接至其他节点的FlowLink数组，仅供设计时调用
    /// </summary>
    public FlowLink[]? GetAvailableOutLinks()
    {
        var links = GetOutLinks();
        if (links == null || links.Length == 0)
            return null;
        return links.Where(t => t.SourceConnection == null).ToArray();
    }

    #region ====Serialization====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteFieldId(1);
        ws.WriteString(Title);
        ws.WriteFieldId(2);
        ws.WriteFloat(X);
        ws.WriteFloat(Y);

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom(IInputStream rs)
    {
        var propIndex = 0;
        do
        {
            propIndex = rs.ReadFieldId();
            switch (propIndex)
            {
                case 1: Title = rs.ReadString()!; break;
                case 2:
                    X = rs.ReadFloat();
                    Y = rs.ReadFloat();
                    break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(ActivityModel), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}