using AppBox.Workflow;
using AppBoxCore;
using NanoLog;
using NUnit.Framework;

namespace Tests.Workflow;

public class WorkflowRuntimeTest
{
    private readonly MockWorkflowStore _store = new();
    private readonly Guid _mockUserId = Guid.NewGuid();
    private readonly Guid _mockManager1Id = Guid.NewGuid();
    private readonly Guid _mockManager2Id = Guid.NewGuid();
    private readonly Guid _mockManager3Id = Guid.NewGuid();

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
        var start = new StartActivity() { Next = new RuntimeFlowLink(decision) };
        var instance = new WorkflowInstance("TestDecision", start, _mockUserId, null);
        await instance.Start(_store);

        await instance.WaitForSuspendedOrFinished();
    }

    [Test(Description = "单人活动")]
    public async Task TestSingleHuman()
    {
        var approveActivity = new AutomationActivity("通过");
        var rejectActivity = new AutomationActivity("拒绝");
        var singleHumanActivity = new SingleHumanActivity("经理审批",
            [new HumanActor(Expression.Constant(_mockManager1Id))],
            [new HumanAction("同意"), new HumanAction("不同意")],
            [approveActivity, rejectActivity]);
        var start = new StartActivity() { Next = new RuntimeFlowLink(singleHumanActivity) };
        var instance = new WorkflowInstance("TestSingleHuman", start, _mockUserId, null);
        await instance.Start(_store);
        await instance.WaitForSuspendedOrFinished();

        var bookmarks = instance.GetAllBookmarks();
        var bookmarkId = bookmarks[0].Id;
        await instance.Resume(bookmarkId, _mockManager1Id, new HumanActionResult("Manager1", "同意", "备注"));
        await instance.WaitForSuspendedOrFinished();
    }

    [Test(Description = "多人活动")]
    public async Task TestMultipleHuman()
    {
        var approveActivity = new AutomationActivity("通过");
        var rejectActivity = new AutomationActivity("拒绝");
        var resultsParameter = Expression.Parameter(MultiHumanActivity.ActorResultParameterName,
            new ExpressionTypeInfo(ExpressionTypeInfo.KnownType.Dictionary, types:
            [
                ExpressionTypeInfo.String,
                ExpressionTypeInfo.Int32
            ]));
        var actorCountParameter =
            Expression.Parameter(MultiHumanActivity.ActorCountParameterName, ExpressionTypeInfo.Int32);
        var itemAccess = Expression.InstancePropertyIndexer(resultsParameter, "Item",
            [Expression.Constant("同意")], ExpressionTypeInfo.Int32);
        var multiHumanActivity = new MultiHumanActivity("专家会签",
            [
                new HumanActor(Expression.Constant(_mockManager1Id)),
                new HumanActor(Expression.Constant(_mockManager2Id)),
                new HumanActor(Expression.Constant(_mockManager3Id))
            ],
            [new HumanAction("同意"), new HumanAction("不同意")],
            [
                Expression.GreaterThan(
                    itemAccess,
                    Expression.Divide(actorCountParameter, Expression.Constant(2))
                ),
                null
            ],
            [approveActivity, rejectActivity]
        );

        var start = new StartActivity() { Next = new RuntimeFlowLink(multiHumanActivity) };
        var instance = new WorkflowInstance("TestMultiHuman", start, _mockUserId, null);
        await instance.Start(_store);
        await instance.WaitForSuspendedOrFinished();

        var bookmarks = instance.GetAllBookmarks();
        var bookmarkId = bookmarks.First().Id;
        //审批者1递交
        await instance.Resume(bookmarkId, _mockManager1Id, new HumanActionResult("Manager1", "同意", "备注1"));
        await instance.WaitForSuspendedOrFinished();
        //审批者2递交
        await instance.Resume(bookmarkId, _mockManager2Id, new HumanActionResult("Manager2", "同意", "备注2"));
        await instance.WaitForSuspendedOrFinished();
    }

    [Test(Description = "并行")]
    public async Task TestForkJoin()
    {
        //join
        var joinActivity = new JoinActivity("聚合", 2, null);
        //branch1
        var autoActivity = new AutomationActivity("抄送", null, joinActivity);
        //branch2
        var approveActivity = new AutomationActivity("通过", null, joinActivity);
        var rejectActivity = new AutomationActivity("拒绝", null, joinActivity);
        var singleHumanActivity = new SingleHumanActivity("经理审批",
            [new HumanActor(Expression.Constant(_mockManager1Id))],
            [new HumanAction("同意"), new HumanAction("不同意")],
            [approveActivity, rejectActivity]);
        //fork
        var forkActivity = new ForkActivity("并行", [autoActivity, singleHumanActivity]);
        var start = new StartActivity() { Next = new RuntimeFlowLink(forkActivity) };

        var instance = new WorkflowInstance("TestSingleHuman", start, _mockUserId, null);
        await instance.Start(_store);
        await instance.WaitForSuspendedOrFinished();

        var bookmarks = instance.GetAllBookmarks();
        var bookmarkId = bookmarks[0].Id;
        await instance.Resume(bookmarkId, _mockManager1Id, new HumanActionResult("Manager1", "同意", "备注"));
        await instance.WaitForSuspendedOrFinished();
    }
}