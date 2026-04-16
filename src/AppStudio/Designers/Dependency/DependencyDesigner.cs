using AppBoxCore;
using AppBoxDesign.Dependency;
using PixUI;
using PixUI.Diagram;

namespace AppBoxDesign;

internal sealed class DependencyDesigner : View, IDesigner
{
    public DependencyDesigner(DesignHub designContext)
    {
        _designContext = designContext;
        _designService = new DependencyDesignService();

        FillColor = new Color(0xFF2B2B2B);

        Child = new DiagramView(_designService);
    }

    private readonly DesignHub _designContext;
    private readonly DependencyDesignService _designService;
    private ModelNode _targetNode = null!;
    private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;

    public void SetTargetModelNode(ModelNode modelNode)
    {
        if (ReferenceEquals(_targetNode, modelNode)) return;

        _targetNode = modelNode;
        _designService.Surface.ClearItems();
        LoadAndLayout();
    }

    private async void LoadAndLayout()
    {
        var type = FindUsagesCommand.ModelTypeToReferenceType(_targetNode.ModelType);
        var usages = await FindUsagesCommand.Find(_designContext, type, _targetNode);
        DesignStore.UpdateUsages(usages);

        var target = new DependencyItem(_designContext, _targetNode);

        var items = usages
            .DistinctBy(u => u.ModelId)
            .Select(u => new DependencyItem(_designContext, u.ModelNode))
            .ToList();

        var center = _designService.Surface.LayoutBounds.Center;
        DependencyLayout.Layout(target, items, center);

        var surface = _designService.Surface;

        foreach (var item in items)
        {
            var conn = new DependencyConnection();
            IConnector sourceConnector;
            IConnector destConnector;

            if (item.ModelNode.ModelType == ModelType.Entity)
            {
                sourceConnector = item.Connectors[ConnectorPosition.Bottom]!;
                destConnector = target.Connectors[ConnectorPosition.Top]!;
            }
            else if (item.ModelNode.ModelType == ModelType.Service)
            {
                sourceConnector = item.Connectors[ConnectorPosition.Top]!;
                destConnector = target.Connectors[ConnectorPosition.Bottom]!;
            }
            else if (item.ModelNode.ModelType == ModelType.View)
            {
                sourceConnector = item.Connectors[ConnectorPosition.Left]!;
                destConnector = target.Connectors[ConnectorPosition.Right]!;
            }
            else
            {
                sourceConnector = item.Connectors[ConnectorPosition.Right]!;
                destConnector = target.Connectors[ConnectorPosition.Left]!;
            }

            conn.Attach(sourceConnector, destConnector);
            surface.AddItem(conn);
            surface.AddItem(item);
        }

        surface.AddItem(target);

        surface.Repaint();
    }

    public override void Layout(float availableWidth, float availableHeight)
    {
        //暂在这里移动所有元素的位置
        var oldWidth = LayoutBounds.Width;
        var oldHeight = LayoutBounds.Height;

        base.Layout(availableWidth, availableHeight);

        var dx = (LayoutBounds.Width - oldWidth) / 2f;
        var dy = (LayoutBounds.Height - oldHeight) / 2f;
        foreach (var item in _designService.Surface.Items)
        {
            if (item is DependencyItem)
                item.Move(new Offset(dx, dy));
        }
    }

    #region ====IDesigner====

    public Task SaveAsync() => Task.CompletedTask;

    public Task RefreshAsync() => Task.CompletedTask;

    public void GotoLocation(ILocation location) { }
    public void OnClose() { }

    #endregion
}