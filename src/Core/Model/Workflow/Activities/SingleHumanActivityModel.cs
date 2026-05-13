using System.ComponentModel;

namespace AppBoxCore;

/// <summary>
/// 单人活动模型
/// </summary>
public sealed class SingleHumanActivityModel : HumanActivityModel
{
       
    [Browsable(false)]
    public new List<ConditionLink> ResultConditions
    {
        get { return base.ResultConditions;}
    }

    public override bool IsSingleHuman
    {
        get { return true; }
    }

    public SingleHumanActivityModel()
    {
        Title = "单人活动";
    }

}