namespace AppBoxCore;

public sealed class MultiHumanNode : HumanNode
{
    public MultiHumanNode()
    {
        Title = "多人活动";
    }

    public override byte Type => ActivityType.MultiHumanActivity;

    public override bool IsSingleHuman => false;

    /// <summary>
    /// 是否必须等待所有参与者处理再判断处理结果，比如用于一票否决的场景
    /// </summary>
    public bool WaitAllActor { get; set; }
}