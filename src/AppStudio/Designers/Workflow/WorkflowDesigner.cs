using AppBoxCore;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class WorkflowDesigner : View, IDesignerWithProblems
{
    public WorkflowDesigner(DesignContext designContext, ModelNode modelNode)
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

    private readonly DesignContext _designContext;
    private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
    private readonly WorkflowDiagramService _diagramService;
    private bool _hasLoaded;
    public ModelNode ModelNode { get; }
    private WorkflowModel Model => (WorkflowModel)ModelNode.Model;

    private Container BuildCommandBar() => new()
    {
        Height = 40,
        Padding = EdgeInsets.All(5),
        FillColor = Colors.Gray,
        Child = new Row(VerticalAlignment.Middle, 10f)
        {
            Children =
            [
                new Button("Validate") { OnTap = _ => OnValidate() },
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

    private void OnValidate()
    {
        var validator = new WorkflowValidator();
        var problems = validator.Validate(Model.StartNode);
        Model.IsValid = !validator.HasError;
        DesignStore.UpdateProblems(ModelNode, problems.Cast<IModelProblem>().ToList());
    }

    public void GotoProblem(IModelProblem problem)
    {
        var errorInfo = (WorkflowValidator.ErrorInfo)problem;
        _diagramService.SelectNode(errorInfo.Node);
    }

    #region ====IModelDesigner====

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => _diagramService.Toolbox;

    public Task SaveAsync()
    {
        OnValidate();
        return ModelNode.SaveAsync(null);
    }

    public Task RefreshAsync() => Task.CompletedTask;

    public void GotoLocation(ILocation location) { }

    void IDesigner.OnClose() { }

    #endregion
}