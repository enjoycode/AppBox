using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 用于设计时验证工作流是否有效
/// </summary>
internal sealed class WorkflowValidator
{
    private readonly Dictionary<ActivityNode, BranchInfo> _visits = [];
    private readonly List<ForkJoinPair> _forkJoinPairs = [];
    private readonly List<ErrorInfo> _errors = [];

    public int VisitedNodesCount => _visits.Count;

    public IReadOnlyList<ErrorInfo> Validate(StartNode startNode)
    {
        //添加默认分支
        var defaultBranch = new BranchInfo();
        //开始遍历
        Visit(null, startNode, defaultBranch);
        //验证分支有效性
        foreach (var pair in _forkJoinPairs)
        {
            if (!pair.CheckAllBranchLinkToJoinNode())
                AddError(pair.ForkNode, ErrorCode.ForkNodeNotAllBranchesLinkToJoinNode);
        }

        return _errors;
    }

    private void Visit(FlowLink? incomingLink, ActivityNode node, BranchInfo branch)
    {
        if (!_visits.TryAdd(node, branch))
        {
            //特殊处理JoinNode，允许重复Visit
            if (node is JoinNode joinNode)
                VisitJoinNode(incomingLink!, joinNode, branch, _visits[node]);

            return;
        }

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
            AddError(startNode, ErrorCode.StartNodeWithoutNext);
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
            AddError(node, ErrorCode.WithoutAnyCondition);
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

        if (elseBranchCount > 1) AddError(node, ErrorCode.MultiElseCondition);
        if (elseBranchIndex == -1) AddError(node, ErrorCode.WithoutElseCondition);
        if (elseBranchIndex != outlinks.Length - 1) AddError(node, ErrorCode.ElseConditionMustBeLastOne);

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
            AddError(forkNode, ErrorCode.ForkNodeWithoutAnyBranch);
            return;
        }

        var forkJoinPair = new ForkJoinPair() { ForkNode = forkNode };
        _forkJoinPairs.Add(forkJoinPair);
        for (var i = 0; i < forkNode.Branches.Count; i++)
        {
            var forkBranch = new BranchInfo() { Parent = branch, ForkJoinPair = forkJoinPair, BranchIndex = i + 1 };
            VisitLink(forkNode.Branches[i], forkBranch);
        }
    }

    private void VisitJoinNode(FlowLink incomingLink, JoinNode joinNode, BranchInfo branch,
        BranchInfo? existsBranch = null)
    {
        if (branch.Parent == null || branch.ForkJoinPair == null)
        {
            AddError(joinNode, ErrorCode.DefaultBranchLinkToJoinNode);
            return; //暂不处理后续
        }

        if (!branch.ForkJoinPair.OnVisitJoinNode(joinNode, existsBranch, out var error))
        {
            AddError(joinNode, error, incomingLink, true);
            return; //暂不处理后续
        }

        if (existsBranch == null) //非重复Visit
            VisitLink(joinNode.Next, branch.Parent);
    }

    private void VisitLink(FlowLink outgoingLink, BranchInfo branch)
    {
        if (outgoingLink.Target != null)
        {
            Visit(outgoingLink, outgoingLink.Target, branch);
        }
    }

    private void AddError(ActivityNode node, ErrorCode error, FlowLink? link = null, bool isIncomingLink = false) =>
        _errors.Add(new ErrorInfo() { Node = node, ErrorCode = error, Link = link, IsIncomingLink = isIncomingLink });

    internal sealed class ForkJoinPair
    {
        public required ForkNode ForkNode { get; init; }

        public JoinNode? JoinNode { get; private set; }

        private int _childrenBranchCount; //比如Decision或人员活动节点附加的分支数量
        private int _incomingCountForJoinNode; //连接至JoinNode的分支数量

        public void IncrementChildrenBranchCount(int count) => _childrenBranchCount += count;

        /// <summary>
        /// 处理连接的JoinNode
        /// </summary>
        public bool OnVisitJoinNode(JoinNode joinNode, BranchInfo? existsBranch, out ErrorCode error)
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
            if (existsBranch != null && existsBranch.ForkJoinPair != this)
            {
                error = ErrorCode.MultiForkNodeLinkToOneJoinNode;
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
                error = ErrorCode.OneForkNodeLinkToMultiJoinNode;
                return false;
            }

            JoinNode ??= joinNode;
            _incomingCountForJoinNode++;
            error = ErrorCode.None;
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
        public required ErrorCode ErrorCode { get; init; }
        public required ActivityNode Node { get; init; }
        public FlowLink? Link { get; init; }
        public string Message => ErrorCode.ToString();
        public bool IsIncomingLink { get; init; }
        public bool IsError => true;

        public string Position
        {
            get
            {
                if (Link == null) return Node.ToString();
                return IsIncomingLink
                    ? $"{Link.Title} --> {Node}"
                    : $"{Node} --> {Link.Title}";
            }
        }
    }

    internal enum ErrorCode : byte
    {
        None = 0,

        /// <summary>
        /// StartNode未连接至其他节点
        /// </summary>
        StartNodeWithoutNext,

        /// <summary>
        /// 不同的ForkNode连接至相同的JoinNode
        /// </summary>
        MultiForkNodeLinkToOneJoinNode,

        /// <summary>
        /// 相同的ForkNode连接至不同的JoinNode
        /// </summary>
        OneForkNodeLinkToMultiJoinNode,

        /// <summary>
        /// ForkNode无任何分支
        /// </summary>
        ForkNodeWithoutAnyBranch,

        /// <summary>
        /// ForkNode的所有分支未全部连接至JoinNode
        /// </summary>
        ForkNodeNotAllBranchesLinkToJoinNode,

        /// <summary>
        /// 默认分支连接至JoinNode
        /// </summary>
        DefaultBranchLinkToJoinNode,

        /// <summary>
        /// 无任何条件
        /// </summary>
        WithoutAnyCondition,

        /// <summary>
        /// 多个Else条件(DecisionNode and HumanNode)
        /// </summary>
        MultiElseCondition,

        /// <summary>
        /// 无Else条件
        /// </summary>
        WithoutElseCondition,

        /// <summary>
        /// Else条件必须是最后一个
        /// </summary>
        ElseConditionMustBeLastOne,
    }
}