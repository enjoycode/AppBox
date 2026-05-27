namespace AppBoxCore;

public sealed class MultiHumanNode : HumanNode
{
    public MultiHumanNode()
    {
        Title = "多人活动";
    }

    public override byte Type => ActivityType.MultiHumanActivity;

    public override bool IsSingleHuman => false;
}