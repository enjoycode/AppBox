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
        ws.WriteString(Title);
        ws.WriteFloat(X);
        ws.WriteFloat(Y);
        ws.WriteFloat(W);
        ws.WriteFloat(H);
        
        ws.WriteFieldEnd();
    }

    public virtual void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Title = rs.ReadString() ?? string.Empty;
        X = rs.ReadFloat();
        Y = rs.ReadFloat();
        W = rs.ReadFloat();
        H = rs.ReadFloat();

        rs.ReadFieldId();
    }

    #endregion
}