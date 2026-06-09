using AppBox.Workflow;
using AppBoxCore;
using NanoLog;
using NUnit.Framework;

namespace Tests.Server.Workflow;

public class WorkflowRuntimeTest
{
    private readonly MockWorkflowStore _store = new();
    private readonly Guid _mockUserId = Guid.NewGuid();
    private readonly Guid _mockManagerId = Guid.NewGuid();

    [SetUp]
    public void Setup()
    {
        NanoLogger.Start(new NanoLoggerOptions().AddLogger(new UnitTestConsoleLogger()));
    }

    [Test(Description = "条件判断")]
    public async Task TestDecision()
    {
        var trueActivity = new AutomationActivity("是");
        var falseActivity = new AutomationActivity("否");
        var decision = new DecisionActivity("判断条件",
            [Expression.Constant(false), null],
            [trueActivity, falseActivity]);
        var start = new StartActivity() { Next = decision };
        var instance = new WorkflowInstance("TestDecision", start, _mockUserId, "Test", []);
        await instance.Start(_store);

        await instance.WaitForSuspendedOrFinished();
    }

    [Test(Description = "单人活动")]
    public async Task TestSingleHuman()
    {
        var approveActivity = new AutomationActivity("Approve");
        var rejectActivity = new AutomationActivity("Reject");
        var singleHumanActivity = new SingleHumanActivity("经理审批",
            [new HumanActor(Expression.Constant(_mockManagerId))],
            [new HumanAction("同意"), new HumanAction("不同意")],
            [approveActivity, rejectActivity]);
        var start = new StartActivity() { Next = singleHumanActivity };
        var instance = new WorkflowInstance("TestBookmark", start, _mockUserId, "Test", []);
        await instance.Start(_store);
        await instance.WaitForSuspendedOrFinished();

        var bookmarks = instance.GetAllBookmarks();
        var bookmarkId = bookmarks.First().Id;
        await instance.Resume(bookmarkId, _mockManagerId, new HumanActionResult() { Result = "同意", Memo = "备注" });
        await instance.WaitForSuspendedOrFinished();
    }
}