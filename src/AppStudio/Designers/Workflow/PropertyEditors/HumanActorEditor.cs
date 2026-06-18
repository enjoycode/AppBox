using AppBoxCore;
using AppBoxDesign.Diagram;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class HumanActorEditor : ListEditorBase<HumanActor>
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new HumanActionEditor(prop), VerticalAlignment.Top);

    public HumanActorEditor(IDiagramProperty propertyItem) :
        base(propertyItem, a => a.DisplayName) { }

    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;
    private HumanNode HumanNode => (HumanNode)ActivityDesigner.Node;

    protected override void OnAdd()
    {
        var listPopup = new ListPopup<string>(Overlay!,
                (v, idx, s) =>
                {
                    var color = s.ToComputed(i => i == idx ? Colors.White : Colors.Black);
                    return new Text(v) { TextColor = color };
                }, 200, 25)
            { OnSelectionChanged = OnAddItem };
        listPopup.DataSource = [];
        listPopup.Show(AddButton, new Offset(-4, -2), Popup.DefaultTransitionBuilder);
    }

    private void OnAddItem(string? item) { }
}