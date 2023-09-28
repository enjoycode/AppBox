using PixUI;

namespace AppBoxDesign;

internal sealed class ToolboxPad : View
{
    public ToolboxPad(DesignStore designStore)
    {
        _designStore = designStore;
        _designStore.DesignerController.TabSelectChanged += OnActiveDesignerChanged;

        Child = NotSupported;
    }

    private readonly DesignStore _designStore;
    private readonly Widget NotSupported = new Center { Child = new Text("Not supported.") };

    protected override void OnMounted() => BuildToolboxView();

    private void OnActiveDesignerChanged(int index)
    {
        if (!IsMounted) return;

        BuildToolboxView();
    }

    private void BuildToolboxView()
    {
        var designer = _designStore.ActiveDesigner;
        if (designer is IModelDesigner modelDesigner)
        {
            var toolboxPad = modelDesigner.GetToolboxPad();
            if (toolboxPad != null)
            {
                Child = toolboxPad;
                Invalidate(InvalidAction.Relayout);
                return;
            }
        }

        //no outline view
        if (!ReferenceEquals(Child, NotSupported))
        {
            Child = NotSupported;
            Invalidate(InvalidAction.Relayout);
        }
    }
}