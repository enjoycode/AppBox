namespace AppBoxCore;

/// <summary>
/// 单人活动模型
/// </summary>
public sealed class SingleHumanNode : HumanNode
{
    public SingleHumanNode()
    {
        Title = "单人活动";
    }

    public override byte Type => ActivityType.SingleHumanActivity;

    public override bool IsSingleHuman => true;
}