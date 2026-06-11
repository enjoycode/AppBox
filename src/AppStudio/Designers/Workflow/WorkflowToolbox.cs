using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowToolbox : View, IDiagramToolbox
{
    public WorkflowToolbox()
    {
        _treeController.SelectionChanged += OnSelectionChanged;
        _treeController.DataSource = ToolboxItems;

        Child = new Column
        {
            Children =
            {
                new TreeView<DiagramToolboxItem>(_treeController, BuildTreeNode, _ => [])
                {
                    AllowDrag = false,
                    //OnAllowDrag = OnAllowDrag,
                }
            }
        };
    }

    private readonly TreeController<DiagramToolboxItem> _treeController = new();

    private static readonly List<DiagramToolboxItem> ToolboxItems =
    [
        //@formatter:off
        new() { Name = "Connection", IsConnection = true, Creator = () => new ActivityConnection(), Icon = MaterialIcons.Moving },
        new() { Name = "Decision", Creator = () => new ActivityDesigner(CreateDecisionNode()), Icon = MaterialIcons.ForkRight },
        new() { Name = "Automation", Creator = () => new ActivityDesigner(new AutomationNode()), Icon = MaterialIcons.Settings },
        new() { Name = "SingleHuman", Creator = () => new ActivityDesigner(new SingleHumanNode()) ,Icon = MaterialIcons.Person },
        new() { Name = "MultiHuman", Creator = () => new ActivityDesigner(new MultiHumanNode()) ,Icon = MaterialIcons.Group },
        //@formatter:on
    ];

    private static DecisionNode CreateDecisionNode()
    {
        var node = new DecisionNode();
        node.Title = "条件判断";
        //建立默认的两个条件分支
        var cTrue = new ConditionLink();
        cTrue.Title = "是";
        cTrue.Condition = new ConstantExpression(true);
        node.Conditions.Add(cTrue);
        var cFalse = new ConditionLink();
        cFalse.Title = "否";
        node.Conditions.Add(cFalse);
        return node;
    }

    public IDiagramToolboxItem? SelectedItem { get; private set; }

    private static void BuildTreeNode(TreeNode<DiagramToolboxItem> node)
    {
        var data = node.Data;
        node.Label = new Text(data.Name);
        node.Icon = new Icon(data.Icon);
        node.IsLeaf = true;
        node.IsExpanded = true;
    }

    private void OnSelectionChanged() => SelectedItem = _treeController.FirstSelectedNode?.Data;

    public void ClearSelectedItem() => _treeController.ClearSelection();
}