using AppBoxCore;

namespace AppBox.Workflow;

public sealed class MultiHumanActivity : HumanActivity
{
    //private int _humanCount; //记录当前节点所分发的人员总数
    //private int[] _actionResults; //记录每个Action的结果次数

    public override byte Type => ActivityType.MultiHumanActivity;
}