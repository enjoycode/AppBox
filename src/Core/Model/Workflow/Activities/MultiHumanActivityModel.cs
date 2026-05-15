namespace AppBoxCore;

public sealed class MultiHumanActivityModel : HumanActivityModel
{
    public MultiHumanActivityModel()
    {
        Title = "多人活动";
    }

    public override byte Type => ActivityType.MultiHumanActivity;

    public override bool IsSingleHuman
    {
        get { return false; }
    }
}