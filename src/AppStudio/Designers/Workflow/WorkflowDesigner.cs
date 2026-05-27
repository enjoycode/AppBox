using AppBoxCore;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowDesigner : View, IModelDesigner
{
    public WorkflowDesigner(DesignHub designContext, ModelNode modelNode)
    {
        _designContext = designContext;
        ModelNode = modelNode;
        _diagramService = new WorkflowDiagramService(designContext, (WorkflowModel)modelNode.Model);

        Child = new Splitter
        {
            Fixed = Splitter.FixedPanel.Panel2,
            Distance = 260,
            Panel1 = new Column
            {
                Children =
                {
                    BuildCommandBar(),
                    new DiagramView(_diagramService)
                }
            },
            Panel2 = _diagramService.PropertyPanel,
        };
    }

    private readonly DesignHub _designContext;
    private readonly WorkflowDiagramService _diagramService;
    private bool _hasLoaded;
    public ModelNode ModelNode { get; }

    private Container BuildCommandBar() => new()
    {
        Height = 40,
        Padding = EdgeInsets.All(5),
        FillColor = Colors.Gray,
        Child = new Row(VerticalAlignment.Middle, 10f)
        {
            Children =
            [
                new Button("Layout")
            ]
        }
    };

    protected override void OnMounted()
    {
        base.OnMounted();
        TryLoad();
    }

    private void TryLoad()
    {
        if (_hasLoaded) return;
        _hasLoaded = true;

        var model = (WorkflowModel)ModelNode.Model;
        var visitor = new WorkflowDesignVisitor();
        visitor.Visit(model.StartNode);

        foreach (var item in visitor.Designers)
            _diagramService.Surface.AddItem(item);
        foreach (var item in visitor.Connections)
            _diagramService.Surface.AddItem(item);

        _diagramService.OnLoaded();
    }

    #region ====IModelDesigner====

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => _diagramService.Toolbox;

    public Task SaveAsync()
    {
        return ModelNode.SaveAsync(null);
    }

    public Task RefreshAsync() => Task.CompletedTask;

    public void GotoLocation(ILocation location) { }

    void IDesigner.OnClose() { }

    #endregion
}