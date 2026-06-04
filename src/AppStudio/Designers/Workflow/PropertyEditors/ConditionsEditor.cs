using System.Text;
using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ConditionsEditor : ListEditorBase<ConditionLink>
{
    internal static EditorFactory Factory => (ctx, prop) =>
        new(new ConditionsEditor(ctx, prop), VerticalAlignment.Top);

    public ConditionsEditor(DesignContext designContext, IDiagramProperty propertyItem)
        : base(propertyItem, c => c.Name ?? "[Unnamed]")
    {
        _designContext = designContext;
    }

    private readonly DesignContext _designContext;
    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;

    private WorkflowModel WorkflowModel =>
        ((WorkflowDiagramService)ActivityDesigner.Surface!.DiagramService).WorkflowModel;

    protected override async void OnEdit()
    {
        if (SelectedIndex.Value < 0) return;

        var link = DataSources[SelectedIndex.Value];
        var dlg = new ConditionDialog(_designContext, WorkflowModel, ActivityDesigner.Node, link);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        try
        {
            link.Condition = dlg.ParseToExpression();
        }
        catch (Exception e)
        {
            Notification.Error($"Can't parse expression: {e.Message}");
        }
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
        public ConditionDialog(DesignContext designContext, WorkflowModel workflowModel, ActivityNode node,
            ConditionLink link)
        {
            Title.Value = "Condition Editor";
            Width = 580;
            Height = 400;


            _nameState = new RxProxy<string>(() => link.Name ?? "[Unnamed]", v => link.Name = v);
            var expressionInfo = MakeExpressionInfo(workflowModel, node, link);
            _expressionEditor = new ExpressionEditor(designContext, expressionInfo);
        }

        private readonly State<string> _nameState;
        private readonly ExpressionEditor _expressionEditor;

        public Expression? ParseToExpression() => _expressionEditor.ParseToExpression();

        private static ExpressionInfo MakeExpressionInfo(WorkflowModel workflowModel, ActivityNode activityNode,
            ConditionLink link)
        {
            // var methodName = "Expression";
            // if (activityNode is DecisionNode decisionNode && CodeUtil.IsValidIdentifier(decisionNode.Title))
            //     methodName = decisionNode.Title;

            //构建表达式代码
            var expressionCode = string.Empty;
            if (!Expression.IsNull(link.Condition))
            {
                //TODO:判断BlockExpression,不需要附加return,但附加preTabs
                var sb = new StringBuilder();
                sb.Append("        return ");
                link.Condition!.ToCode(sb, 0); //TODO: use ExpressionToCSharpCode
                sb.Append(";\n");
                expressionCode = sb.ToString();
            }

            return new ExpressionInfo()
            {
                Owner = workflowModel,
                ClassName = workflowModel.Name,
                ReturnType = "bool",
                MethodName = "Expression",
                ExpressionCode = expressionCode,
                PartialCode = BuildWorkflowPartialCode(workflowModel),
                IsStatic = false,
            };
        }

        /// <summary>
        /// 生成虚拟的Workflow类，主要包括参数
        /// </summary>
        private static string BuildWorkflowPartialCode(WorkflowModel workflowModel)
        {
            var sb = new StringBuilder();
            sb.Append("partial class ");
            sb.Append(workflowModel.Name);
            sb.Append('{');

            //Workflow parameters
            foreach (var parameter in workflowModel.Parameters)
            {
                sb.Append("public ");
                sb.Append(parameter.GetRuntimeType());
                sb.Append(' ');
                sb.Append(parameter.Name);
                sb.Append("{get;");
                if (parameter.IsLocalVariable) sb.Append("set;");
                sb.Append('}');
            }

            sb.Append('}');
            return sb.ToString();
        }

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
                        _expressionEditor
                    ]
                }
            };
        }
    }
}