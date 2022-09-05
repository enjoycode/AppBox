using System;
using PixUI;

namespace AppBoxDesign;

internal sealed class OutlinePad : View
{
    public OutlinePad()
    {
        DesignStore.DesignerController.TabSelectChanged += OnActiveDesignerChanged;

        Child = NotSupported;
    }

    private readonly Widget NotSupported = new Center { Child = new Text("Not supported.") };

    protected override void OnMounted() => BuildOutlineView(false);

    private void OnActiveDesignerChanged(int index)
    {
        Console.WriteLine($"激活的设计器变更为: {index}");
        
        if (!IsMounted) return;

        BuildOutlineView(true);
    }

    private void BuildOutlineView(bool byChangeDesigner)
    {
        var designer = DesignStore.ActiveDesigner;
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

        if (byChangeDesigner)
        {
            Child = NotSupported;
            Invalidate(InvalidAction.Relayout);
        }
    }
}