using AppBoxCore;

namespace AppBox.Workflow;

public sealed class ForkActivity : Activity
{
    public override byte Type => ActivityType.ForkActivity;
}