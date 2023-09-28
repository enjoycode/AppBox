using PixUI;

namespace AppBoxDesign;

internal sealed class OutlinePad : View
{
    public OutlinePad(DesignStore designStore)
    {
        _designStore = designStore;
        _designStore.DesignerController.TabSelectChanged += OnActiveDesignerChanged;

        Child = NotSupported;
    }

    private readonly DesignStore _designStore;
    private readonly Widget NotSupported = new Center { Child = new Text("Not supported.") };

    protected override void OnMounted() => BuildOutlineView();

    private void OnActiveDesignerChanged(int index)
    {
        if (!IsMounted) return;

        BuildOutlineView();
    }

    private void BuildOutlineView()
    {
        var designer = _designStore.ActiveDesigner;
        if (designer is IModelDesigner modelDesigner)
        {
            var outlinePad = modelDesigner.GetOutlinePad();
            if (outlinePad != null)
            {
                Child = outlinePad;
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