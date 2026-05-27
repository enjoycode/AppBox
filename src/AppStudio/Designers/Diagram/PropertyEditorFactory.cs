using PixUI;

namespace AppBoxDesign.Diagram;

internal readonly struct EditorInfo
{
    public EditorInfo(Widget editor, VerticalAlignment verticalAlignment = VerticalAlignment.Middle)
    {
        Editor = editor;
        VerticalAlignment = verticalAlignment;
    }

    public readonly Widget Editor;
    public readonly VerticalAlignment VerticalAlignment;

    public static implicit operator EditorInfo(Widget editor) => new(editor);
}

internal delegate EditorInfo EditorFactory(DesignHub ctx, IDiagramProperty prop);