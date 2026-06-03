using System.Text;
using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ConditionsEditor : ListEditorBase<ConditionLink>
{
    internal static EditorFactory Factory => (ctx, prop) =>
        new(new ConditionsEditor(ctx, prop), VerticalAlignment.Top);

    public ConditionsEditor(DesignHub designContext, IDiagramProperty propertyItem)
        : base(propertyItem, c => c.Name ?? "[Unnamed]")
    {
        _designContext = designContext;
    }

    private readonly DesignHub _designContext;
    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;

    private WorkflowModel WorkflowModel =>
        ((WorkflowDiagramService)ActivityDesigner.Surface!.DiagramService).WorkflowModel;

    protected override void OnEdit()
    {
        if (SelectedIndex.Value < 0) return;

        var link = DataSources[SelectedIndex.Value];
        var dlg = new ConditionDialog(_designContext, WorkflowModel, ActivityDesigner.Node, link);
        dlg.Show();
    }

    protected override void OnRemove()
    {
        if (SelectedIndex.Value < 0) return;

        var link = DataSources[SelectedIndex.Value];
        //从现有的连接线查找，从画布中移除
        var connections = ActivityDesigner.Surface!.GetConnections().Cast<ActivityConnection>();
        var connection = connections.SingleOrDefault(t => t.Link == link);
        connection?.Remove();
        //删除当前的条件链接
        RemoveSelected();
    }

    private sealed class ConditionDialog : Dialog
    {
        public ConditionDialog(DesignHub designContext, WorkflowModel workflowModel, ActivityNode node,
            ConditionLink link)
        {
            _designContext = designContext;
            _workflowModel = workflowModel;

            Title.Value = "Condition Editor";
            Width = 580;
            Height = 400;

            _expressionClassName = MakeClassName(node);
            _expressionMethodName = MakeMethodName(node);
            _expressionParameters = MakeParameters(workflowModel);
            _nameState = new RxProxy<string>(() => link.Name ?? "[Unnamed]", v => link.Name = v);
        }

        private readonly DesignHub _designContext;
        private readonly WorkflowModel _workflowModel;
        private readonly State<string> _nameState;
        private readonly string _expressionClassName;
        private readonly string _expressionMethodName;
        private readonly string _expressionParameters;

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.Only(20, 20, 20, 0),
                Child = new Column()
                {
                    Spacing = 5,
                    Children =
                    [
                        new Row { Children = [new Text("Title:"), new TextInput(_nameState)] },
                        new ExpressionEditor(_designContext, _workflowModel, _expressionClassName,
                            _expressionMethodName, "bool", _expressionParameters)
                    ]
                }
            };
        }

        private static string MakeClassName(ActivityNode node)
        {
            if (node is DecisionNode)
                return "WorkflowDecision";
            return "WorkflowCondition";
        }

        private static string MakeMethodName(ActivityNode node)
        {
            if (node is DecisionNode decisionNode)
            {
                if (CodeUtil.IsValidIdentifier(decisionNode.Title))
                    return decisionNode.Title;
            }

            return "Expression";
        }

        private static string MakeParameters(WorkflowModel workflowModel)
        {
            if (workflowModel.Parameters.Count == 0)
                return string.Empty;

            var sb = new StringBuilder();
            var hasParameterBefore = false;
            foreach (var parameter in workflowModel.Parameters)
            {
                if (parameter.IsLocalVariable) continue;

                if (hasParameterBefore) sb.Append(", ");
                switch (parameter.Type)
                {
                    case WorkflowParameter.ValueType.Integer:
                        sb.Append("int ");
                        break;
                    case WorkflowParameter.ValueType.Double:
                        sb.Append("double ");
                        break;
                    case WorkflowParameter.ValueType.String:
                        sb.Append("string ");
                        break;
                    case WorkflowParameter.ValueType.Boolean:
                        sb.Append("bool ");
                        break;
                    case WorkflowParameter.ValueType.Guid:
                        sb.Append("Guid ");
                        break;
                    default:
                        sb.Append("object "); //TODO:
                        break;
                }

                sb.Append(parameter.Name);
                hasParameterBefore = true;
            }

            return sb.ToString();
        }
    }
}