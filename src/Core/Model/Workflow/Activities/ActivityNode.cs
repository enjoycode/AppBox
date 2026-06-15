namespace AppBoxCore;

public abstract class ActivityNode : IBinSerializable
{
    //TODO:加入Name属性

    public abstract byte Type { get; }

    public string Title { get; internal set; } = string.Empty;

    public float X { get; set; }
    public float Y { get; set; }
    public float W { get; set; } = 80;
    public float H { get; set; } = 40;

    /// <summary>
    /// 获取源自本身的连接至其他节点的FlowLink
    /// </summary>
    public virtual IEnumerable<FlowLink> GetOutLinks() => [];

    /// <summary>
    /// 获取源自本身的可供连接至其他节点的FlowLink，仅供设计时调用
    /// </summary>
    public virtual IEnumerable<FlowLink> GetAvailableOutLinks() =>
        GetOutLinks().Where(t => t.DiagramConnection == null);

    public override string ToString() =>
        string.IsNullOrEmpty(Title) ? GetType().Name : $"{GetType().Name}[\"{Title}\"]";

    #region ====Serialization====

    public virtual void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteFieldId(1);
        ws.WriteString(Title);
        ws.WriteFieldId(2);
        ws.WriteFloat(X);
        ws.WriteFloat(Y);
        ws.WriteFieldId(3);
        ws.WriteFloat(W);
        ws.WriteFloat(H);

        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
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
                case 3:
                    W = rs.ReadFloat();
                    H = rs.ReadFloat();
                    break;
                case 0: break;
                default: throw SerializationException.ReadUnknownField(nameof(ActivityNode), propIndex);
            }
        } while (propIndex != 0);
    }

    #endregion
}