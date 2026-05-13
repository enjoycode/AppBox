namespace AppBoxCore;

public sealed class MultiHumanActivityModel : HumanActivityModel
{

    public override bool IsSingleHuman
    {
        get { return false; }
    }

    public MultiHumanActivityModel()
    {
        Title = "多人活动";
    }

}