using AppBox.Workflow;
using AppBoxCore;
using NanoLog;
using NUnit.Framework;

namespace Tests.Server.Workflow;

public class WorkflowRuntimeTest
{
    private readonly MockWorkflowStore _store = new();

    [SetUp]
    public void Setup()
    {
        NanoLogger.Start(new NanoLoggerOptions().AddLogger(new UnitTestConsoleLogger()));
    }

    [Test]
    public async Task TestDecision()
    {
        var trueActivity = new AutomationActivity() { Title = "true" };
        var falseActivity = new AutomationActivity() { Title = "false" };
        var decision = new DecisionActivity([Expression.Constant(false), null],
            [trueActivity, falseActivity]) { Title = "条件检查" };
        var start = new StartActivity() { Next = decision };
        var instance = new WorkflowInstance("测试", start, Guid.Empty, "Test", []);
        await instance.Start(_store);

        await instance.WaitForSuspendedOrFinished();
    }
}