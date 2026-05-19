namespace AppBoxCore;

/// <summary>
/// 单人活动模型
/// </summary>
public sealed class SingleHumanActivityModel : HumanActivityModel
{
    public SingleHumanActivityModel()
    {
        Title = "单人活动";
    }

    public override byte Type => ActivityType.SingleHumanActivity;

    public new List<ConditionLink> ResultConditions
    {
        get { return base.ResultConditions; }
    }

    public override bool IsSingleHuman => true;
}