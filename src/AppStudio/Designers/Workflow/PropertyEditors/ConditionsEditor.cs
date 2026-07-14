using System.Text;
using AppBoxCore;
using AppBoxDesign.CodeGenerator;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class ConditionsEditor : ListEditorBase<FlowLink>
{
    internal static EditorFactory Factory => (ctx, prop) =>
        new(new ConditionsEditor(ctx, prop), VerticalAlignment.Top);

    public ConditionsEditor(DesignContext designContext, IDiagramProperty propertyItem)
        : base(propertyItem, c => c.Title ?? "[Unnamed]")
    {
        _designContext = designContext;
    }

    private readonly DesignContext _designContext;
    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;

    private WorkflowModel WorkflowModel =>
        ((WorkflowDiagramService)ActivityDesigner.Surface!.DiagramService).WorkflowModel;

    protected override async void OnAdd()
    {
        var link = new FlowLink();
        var dlg = new ConditionDialog(_designContext, WorkflowModel, ActivityDesigner.Node, link);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        link.Condition = dlg.Expression;
        DataSources.Add(link);
        SelectedIndex.Value = DataSources.Count - 1;
        RefreshDataSources();
    }

    protected override async void OnEdit()
    {
        if (SelectedIndex.Value < 0) return;

        var link = DataSources[SelectedIndex.Value];
        var dlg = new ConditionDialog(_designContext, WorkflowModel, ActivityDesigner.Node, link);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        link.Condition = dlg.Expression;
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
            FlowLink link)
        {
            Title.Value = "Condition Editor";
            Width = 580;
            Height = 400;

            _nameState = new RxProxy<string>(() => link.Title ?? "[Unnamed]", v => link.Title = v);
            var expressionInfo = MakeExpressionInfo(workflowModel, node, link, designContext);
            _expressionEditor = new ExpressionEditor(designContext, expressionInfo);
        }

        private readonly State<string> _nameState;
        private readonly ExpressionEditor _expressionEditor;

        public Expression? Expression { get; private set; }

        private static ExpressionInfo MakeExpressionInfo(WorkflowModel workflowModel, ActivityNode activityNode,
            FlowLink link, DesignContext designContext)
        {
            // var methodName = "Expression";
            // if (activityNode is DecisionNode decisionNode && CodeUtil.IsValidIdentifier(decisionNode.Title))
            //     methodName = decisionNode.Title;

            //构建表达式代码
            var expressionCode = string.Empty;
            if (!Expression.IsNull(link.Condition))
            {
                //TODO:判断BlockExpression,不需要附加return,但附加preTabs
                using var builder = new ExpressionCodeBuilder(designContext);
                builder.StringBuilder.Append("        return ");
                link.Condition!.ToCode(builder);
                builder.StringBuilder.Append(";\n");
                expressionCode = builder.GetCode();
            }

            //根据节点类型构建表达式方法参数
            var parameters = string.Empty;
            if (activityNode is MultiHumanNode)
            {
                parameters = "Dictionary<string, int> actorResult, int actorCount";
            }

            return new ExpressionInfo()
            {
                Owner = workflowModel,
                ClassName = workflowModel.Name,
                ReturnType = "bool",
                MethodName = "Expression",
                Parameters = parameters,
                ExpressionCode = expressionCode,
                PartialCode = BuildWorkflowPartialCode(workflowModel, designContext),
                IsStatic = false,
            };
        }

        /// <summary>
        /// 生成虚拟的Workflow类，主要包括参数
        /// </summary>
        private static string BuildWorkflowPartialCode(WorkflowModel workflowModel, DesignContext designContext)
        {
            var sb = new StringBuilder();
            sb.Append("partial class ");
            sb.Append(workflowModel.Name);
            sb.Append('{');

            //Workflow parameters
            foreach (var parameter in workflowModel.Parameters)
            {
                sb.Append("public ");
                sb.Append(WorkflowCodeGenerator.GetParameterRuntimeType(parameter, designContext));
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

        protected override async ValueTask<bool> OnClosing(DialogResult result)
        {
            if (result == DialogResult.OK)
            {
                try
                {
                    var options = ExpressionParserOptions.DynamicEntityMemberAccess;
                    Expression = await _expressionEditor.ParseToExpression(options);
                }
                catch (Exception e)
                {
                    Notification.Error($"Can't parse expression: {e.Message}");
                    return true;
                }
            }

            return await base.OnClosing(result);
        }
    }
}