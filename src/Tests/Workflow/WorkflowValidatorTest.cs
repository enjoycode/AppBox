using AppBoxCore;
using AppBoxDesign;
using NUnit.Framework;

namespace Tests.Workflow;

public class WorkflowValidatorTest
{
    private void DumpErrors(IReadOnlyList<WorkflowValidator.ErrorInfo> errors)
    {
        foreach (var error in errors)
        {
            Console.WriteLine($"Node:{error.Node}, Msg:{error.Message}, Pos:{error.Position}");
        }
    }

    [Test(Description = "闭环测试，防止死循环")]
    public void TestCircledLoop()
    {
        //          ┌─────┐            
        //          │  A  ├───────────┐
        //          └──┬──┘           │
        // ┌───┐       │      ┌─────┐ │
        // │ S │       ▼    ┌►│  B1 ├─┘
        // │ t │    ┌─────┐ │ └─────┘  
        // │ a ├───►│  B  ├─┤          
        // │ r │    └─────┘ │ ┌─────┐  
        // │ t │            └►│  B2 │  
        // └───┘              └─────┘  

        var startNode = new StartNode();
        var nodeB = new SingleHumanNode("经理审批", [
            new FlowLink("同意") { Condition = Expression.Constant(true) },
            new FlowLink("拒绝")
        ]);
        var nodeB1 = new AutomationNode("B1");
        var nodeB2 = new AutomationNode("B2");
        var nodeA = new AutomationNode("A");

        startNode.Next.Target = nodeB;
        nodeB.ResultConditions[0].Target = nodeB1;
        nodeB.ResultConditions[1].Target = nodeB2;
        nodeB1.Next.Target = nodeA;
        nodeA.Next.Target = nodeB;

        var validator = new WorkflowValidator();
        var errors = validator.Validate(startNode);
        DumpErrors(errors);
        Assert.IsTrue(errors.Count == 0);
        Assert.IsTrue(validator.VisitedNodesCount == 5);
    }

    [Test]
    public void TestMultiForkNodeToOneJoinNode()
    {
        //              ┌─────┐                       ┌───┐
        //         ┌───►│  A  ├──────────────────────►│   │
        //         │    └─────┘                       │   │
        // ┌───┐   │               ┌─────┐            │   │
        // │ F │   │          ┌───►│  B  ├───────────►│ J │
        // │ o ├───┤          │    └─────┘            │ o │
        // │ r │   │    ┌───┐ │                ┌───┐  │ i │
        // │ k │   │    │ F │ │                │ J │  │ n │
        // └───┘   └───►│ o ├─┤             ┌─►│ o ├─►│   │
        //              │ r │ │             │  │ i │  │   │
        //              │ k │ │    ┌─────┐  │  │ n │  │   │
        //              └───┘ └───►│  C  ├──┘  └───┘  └───┘
        //                         └─────┘                 

        var startNode = new StartNode();
        var forkNode1 = new ForkNode("并行1", [new FlowLink("并行1.1"), new FlowLink("并行1.2")]);
        var nodeA = new AutomationNode("A");
        var forkNode2 = new ForkNode("并行2", [new FlowLink("并行2.1"), new FlowLink("并行2.2")]);
        var nodeB = new AutomationNode("B");
        var nodeC = new AutomationNode("C");
        var joinNode2 = new JoinNode("Join2");
        var joinNode1 = new JoinNode("Join1");

        startNode.Next.Target = forkNode1;
        forkNode1.Branches[0].Target = nodeA;
        forkNode1.Branches[1].Target = forkNode2;
        nodeA.Next.Target = joinNode1;
        forkNode2.Branches[0].Target = nodeB;
        forkNode2.Branches[1].Target = nodeC;
        nodeB.Next.Target = joinNode1;
        nodeC.Next.Target = joinNode2;
        joinNode2.Next.Target = joinNode1;

        var validator = new WorkflowValidator();
        var errors = validator.Validate(startNode);
        DumpErrors(errors);
        Assert.IsTrue(errors.Any(e => e.ErrorCode == WorkflowValidator.ErrorCode.MultiForkNodeLinkToOneJoinNode));
        Assert.IsTrue(validator.VisitedNodesCount == 8);
    }
}