using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于设计时验证工作流是否有效
/// </summary>
internal sealed class WorkflowValidator
{
    private readonly HashSet<ActivityNode> _visits = [];
    private readonly List<ForkJoinPair> _forkJoinPairs = [];
    private readonly List<ErrorInfo> _errors = [];

    public IReadOnlyList<ErrorInfo> Validate(StartNode startNode)
    {
        //添加默认分支
        var defaultBranch = new BranchInfo();
        //开始遍历
        Visit(null, startNode, defaultBranch);
        //验证分支有效性
        foreach (var pair in _forkJoinPairs)
        {
            pair.CheckAllBranchLinkToJoinNode();
        }

        return _errors;
    }

    private void Visit(FlowLink? incomingLink, ActivityNode node, BranchInfo branch)
    {
        if (!_visits.Add(node))
            return;

        //根据节点类型处理
        switch (node)
        {
            case StartNode startNode: VisitStartNode(startNode, branch); break;
            case DecisionNode decisionNode: VisitDecisionNode(decisionNode, branch); break;
            case AutomationNode automationNode: VisitAutomationNode(automationNode, branch); break;
            case SingleHumanNode singleHumanNode: VisitSingleHumanNode(singleHumanNode, branch); break;
            case MultiHumanNode multiHumanNode: VisitMultiHumanNode(multiHumanNode, branch); break;
            case ForkNode forkNode: VisitForkNode(forkNode, branch); break;
            case JoinNode joinNode: VisitJoinNode(incomingLink!, joinNode, branch); break;
        }
    }

    private void VisitStartNode(StartNode startNode, BranchInfo branch)
    {
        //先判断有无连接至目标
        if (startNode.Next.Target == null)
        {
            AddError(startNode, "开始节点未连接至其他节点");
            return;
        }

        VisitLink(startNode.Next, branch);
    }

    private void VisitDecisionNode(DecisionNode decisionNode, BranchInfo branch)
    {
        //TODO:考虑警告分支未连接至其他节点
        VisitNodeWithConditionLinks(decisionNode, branch);
    }

    private void VisitSingleHumanNode(SingleHumanNode singleHumanNode, BranchInfo branch)
    {
        VisitNodeWithConditionLinks(singleHumanNode, branch);
    }

    private void VisitMultiHumanNode(MultiHumanNode multiHumanNode, BranchInfo branch)
    {
        VisitNodeWithConditionLinks(multiHumanNode, branch);
    }

    private void VisitNodeWithConditionLinks(ActivityNode node, BranchInfo branch)
    {
        var outlinks = node.GetOutLinks().Cast<ConditionLink>().ToArray();
        if (outlinks.Length == 0)
        {
            AddError(node, $"{node.GetType().Name}无条件分支");
            return;
        }

        branch.ForkJoinPair?.IncrementChildrenBranchCount(outlinks.Length - 1); //注意-1

        //判断有无Else分支且为最后一个
        var elseBranchCount = 0;
        var elseBranchIndex = -1;
        for (var i = 0; i < outlinks.Length; i++)
        {
            if (outlinks[i].IsDefault)
            {
                elseBranchCount++;
                elseBranchIndex = i;
            }
        }

        if (elseBranchCount > 1) AddError(node, $"{node.GetType().Name}的Else条件重复");
        if (elseBranchIndex == -1) AddError(node, $"{node.GetType().Name}的Else条件不存在");
        if (elseBranchIndex != outlinks.Length - 1) AddError(node, $"{node.GetType().Name}的Else条件必须最后一个");

        foreach (var outlink in outlinks)
            VisitLink(outlink, branch);
    }

    private void VisitAutomationNode(AutomationNode automationNode, BranchInfo branch)
    {
        VisitLink(automationNode.Next, branch);
    }

    private void VisitForkNode(ForkNode forkNode, BranchInfo branch)
    {
        //TODO: 1.考虑警告Fork --(直连)-> Fork; 2.警告分支数小于2

        //先移除未连接至目标的分支
        forkNode.Branches.RemoveAll(b => b.Target == null);
        if (forkNode.Branches.Count == 0)
        {
            AddError(forkNode, "ForkNode无并行分支", null);
            return;
        }

        for (var i = 0; i < forkNode.Branches.Count; i++)
        {
            var forkJoinPair = new ForkJoinPair() { ForkNode = forkNode };
            _forkJoinPairs.Add(forkJoinPair);
            var forkBranch = new BranchInfo() { Parent = branch, ForkJoinPair = forkJoinPair, BranchIndex = i + 1 };
            VisitLink(forkNode.Branches[i], forkBranch);
        }
    }

    private void VisitJoinNode(FlowLink incomingLink, JoinNode joinNode, BranchInfo branch)
    {
        if (branch.Parent == null || branch.ForkJoinPair == null)
        {
            AddError(joinNode, "默认分支连接至JoinNode", null);
            return; //暂不处理后续
        }

        if (!branch.ForkJoinPair.OnVisitJoinNode(joinNode, branch, out var error))
        {
            AddError(joinNode, error, incomingLink, true);
            return; //暂不处理后续
        }

        VisitLink(joinNode.Next, branch.Parent);
    }

    private void VisitLink(FlowLink outgoingLink, BranchInfo branch)
    {
        if (outgoingLink.Target != null)
        {
            Visit(outgoingLink, outgoingLink.Target, branch);
        }
    }

    private void AddError(ActivityNode node, string message, FlowLink? link = null, bool isIncomingLink = false) =>
        _errors.Add(new ErrorInfo() { Node = node, Message = message, Link = link, IsIncomingLink = isIncomingLink });

    internal sealed class ForkJoinPair
    {
        public required ForkNode ForkNode { get; init; }

        public JoinNode? JoinNode { get; private set; }

        // public List<BranchInfo> IncomingForJoinNode { get; } = [];
        private int _childrenBranchCount; //比如Decision或人员活动节点附加的分支数量
        private int _incomingCountForJoinNode; //连接至JoinNode的分支数量

        public void IncrementChildrenBranchCount(int count) => _childrenBranchCount += count;

        /// <summary>
        /// 处理连接的JoinNode
        /// </summary>
        /// <returns>false=JoinNode已存在且不相同</returns>
        public bool OnVisitJoinNode(JoinNode joinNode, BranchInfo branch, out string error)
        {
            // 1.不同的ForkNode连接至相同的JoinNode, 下图A->Join与B->Join
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
            if (branch.ForkJoinPair != this)
            {
                error = "不同的ForkNode连接至相同的JoinNode";
                return false;
            }

            // 2.ForkNode连接至不同的JoinNode
            //                           ┌───┐
            //              ┌─────┐      │ J │
            //         ┌───►│  A  ├─────►│ o │
            //         │    └─────┘      │ i │
            // ┌───┐   │                 │ n │
            // │ F │   │                 └───┘
            // │ o ├───┤                      
            // │ r │   │                 ┌───┐
            // │ k │   │    ┌─────┐      │ J │
            // └───┘   └───►│  B  ├─────►│ o │
            //              └─────┘      │ i │
            //                           │ n │
            //                           └───┘
            if (JoinNode != null && JoinNode != joinNode)
            {
                error = "ForkNode连接至不同的JoinNode";
                return false;
            }

            JoinNode ??= joinNode;
            //IncomingForJoinNode.Add(branch);
            _incomingCountForJoinNode++;
            error = string.Empty;
            return true;
        }

        /// <summary>
        /// 检查ForkNode的所有分支是否到达JoinNode
        /// </summary>
        public bool CheckAllBranchLinkToJoinNode()
        {
            //如下图B2未连接至JoinNode
            //              ┌─────┐                        
            //         ┌───►│  A  ├───────────────┐        
            //         │    └─────┘               │        
            // ┌───┐   │                          │   ┌───┐
            // │ F │   │                          │   │ J │
            // │ o ├───┤              ┌─────┐     ├──►│ o │
            // │ r │   │            ┌►│  B1 ├─────┘   │ i │
            // │ k │   │    ┌─────┐ │ └─────┘         │ n │
            // └───┘   └───►│  B  ├─┤                 └───┘
            //              └─────┘ │ ┌─────┐              
            //                      └►│  B2 │              
            //                        └─────┘              
            if (JoinNode == null) return false;
            var totalBranchCount = ForkNode.Branches.Count + _childrenBranchCount;
            return totalBranchCount == _incomingCountForJoinNode;
        }
    }

    internal sealed class BranchInfo
    {
        public BranchInfo? Parent { get; set; }

        public ForkJoinPair? ForkJoinPair { get; set; }

        public int BranchIndex { get; set; }
    }

    internal sealed class ErrorInfo : IModelProblem
    {
        public required ActivityNode Node { get; init; }
        public FlowLink? Link { get; init; }
        public string Message { get; init; } = string.Empty;
        public bool IsIncomingLink { get; init; }
        public bool IsError => true;

        public string Position
        {
            get
            {
                if (Link == null) return $"{Node.GetType().Name}: {Node.Title}";
                return IsIncomingLink
                    ? $"{Link.Name} --> {Node.GetType().Name}: {Node.Title}"
                    : $"{Node.GetType().Name}: {Node.Title} --> {Link.Name}";
            }
        }
    }
}