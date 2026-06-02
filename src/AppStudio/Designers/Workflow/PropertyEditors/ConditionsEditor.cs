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
        var dlg = new ConditionDialog(_designContext, WorkflowModel);
        dlg.Show();
    }

    protected override void OnRemove()
    {
        if (SelectedIndex.Value < 0)
            return;
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
        public ConditionDialog(DesignHub designContext, WorkflowModel workflowModel)
        {
            _designContext = designContext;
            _workflowModel = workflowModel;

            Title.Value = "Condition Editor";
            Width = 580;
            Height = 400;
        }

        private readonly DesignHub _designContext;
        private readonly WorkflowModel _workflowModel;

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
                        new Row { Children = [new Text("Title:"), new TextInput(""),] },
                        new ExpressionEditor(_designContext, _workflowModel)
                    ]
                }
            };
        }
    }
}