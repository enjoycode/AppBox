namespace AppBoxCore;

public interface IActivityConnection { }

public sealed class FlowLink : IBinSerializable
{
    public FlowLink() { }

    internal FlowLink(string title)
    {
        Title = title;
    }

    public string? Title { get; internal set; }

    public Connector SourceConnector { get; internal set; }

    public Connector TargetConnector { get; internal set; }

    public ConnectionType LineType { get; internal set; }

    /// <summary>
    /// 包括开始与结束的所有连接点 [X1, Y1, X2, Y2...]，由设计时保存时设置
    /// </summary>
    public float[] Points { get; internal set; } = [];

    /// <summary>
    /// 连接的目标节点
    /// </summary>
    public ActivityNode? Target { get; internal set; }

    /// <summary>
    /// 条件表达式, Null表式Else分支
    /// </summary>
    public Expression? Condition { get; set; }

    public bool IsDefault => Expression.IsNull(Condition);

    /// <summary>
    /// 仅用于设计时，源自本身的设计时连接线IConnection
    /// </summary>
    public IActivityConnection? DiagramConnection { get; internal set; }

    #region ====Serialization====

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Title);
        ws.WriteByte((byte)LineType);
        ws.WriteByte((byte)SourceConnector);
        ws.WriteByte((byte)TargetConnector);
        ws.SerializeExpression(Condition);
        ws.SerializeActivityNode(Target);
        ws.WriteFloatArray(Points);

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Title = rs.ReadString();
        LineType = (ConnectionType)rs.ReadByte();
        SourceConnector = (Connector)rs.ReadByte();
        TargetConnector = (Connector)rs.ReadByte();
        Condition = (Expression?)rs.Deserialize();
        Target = rs.DeserializeActivityNode();
        Points = rs.ReadFloatArray();
        
        rs.ReadFieldId(); //保留
    }

    #endregion

    public enum ConnectionType : byte
    {
        Polyline,
        Bezier,
        Spline,
    }

    public enum Connector : byte
    {
        Auto = 0,
        Left,
        Top,
        Right,
        Bottom,
        Gliding
    }
}