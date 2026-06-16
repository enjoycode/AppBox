namespace AppBoxCore;

public sealed class MultiHumanNode : HumanNode
{
    public MultiHumanNode()
    {
        Title = "多人活动";
    }

    public override byte Type => ActivityType.MultiHumanActivity;

    /// <summary>
    /// 是否必须等待所有参与者处理再判断处理结果，比如用于一票否决的场景
    /// </summary>
    public bool WaitAllActor { get; internal set; }
    
    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);
        ws.WriteBool(WaitAllActor);
        ws.WriteFieldEnd();
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);
        WaitAllActor = rs.ReadBool();
        rs.ReadFieldId();
    }

    #endregion
}