using AppBoxCore;

namespace AppBox.Workflow;

/// <summary>
/// 运行时的活动连接，从FlowLink复制相关信息
/// </summary>
public sealed class RuntimeFlowLink : IBinSerializable
{
    public RuntimeFlowLink() { }

    /// <summary>
    /// Only for test
    /// </summary>
    internal RuntimeFlowLink(Activity? target, Expression? condition = null)
    {
        Target = target;
        Condition = condition;
    }

    internal RuntimeFlowLink(FlowLink link, Activity target)
    {
        Title = link.Title;
        LineType = link.LineType;
        Points = link.Points;
        Condition = link.Condition;
        Target = target;
    }

    //TODO:考虑加入执行步骤[1,3...]，用于绘制执行路线

    public string? Title { get; private set; }

    public FlowLink.ConnectionType LineType { get; private set; }

    /// <summary>
    /// 包括开始与结束的所有连接点 [X1, Y1, X2, Y2...]
    /// </summary>
    public float[] Points { get; private set; } = [];

    /// <summary>
    /// 连接的目标
    /// </summary>
    public Activity? Target { get; internal set; }

    /// <summary>
    /// 条件表达式, Null表式Else分支
    /// </summary>
    public Expression? Condition { get; internal set; }

    public void WriteTo<TWriter>(ref TWriter ws) where TWriter : struct, IOutputStream
    {
        ws.WriteString(Title);
        ws.SerializeExpression(Condition);
        ws.SerializeActivity(Target);
        ws.WriteByte((byte)LineType);
        ws.WriteFloatArray(Points);

        ws.WriteFieldEnd(); //保留
    }

    public void ReadFrom<TReader>(ref TReader rs) where TReader : struct, IInputStream
    {
        Title = rs.ReadString();
        Condition = (Expression?)rs.Deserialize();
        Target = rs.DeserializeActivity();
        LineType = (FlowLink.ConnectionType)rs.ReadByte();
        Points = rs.ReadFloatArray();

        rs.ReadFieldId(); //保留
    }
}