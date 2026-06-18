using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class HumanActorEditor : ListEditorBase<HumanActor>
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new HumanActorEditor(prop), VerticalAlignment.Top);

    public HumanActorEditor(IDiagramProperty propertyItem) :
        base(propertyItem, a => a.DisplayName) { }

    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;
    private WorkflowDiagramService DiagramService => (WorkflowDiagramService)ActivityDesigner.Surface!.DiagramService;
    private HumanNode HumanNode => (HumanNode)ActivityDesigner.Node;

    protected override void OnAdd()
    {
        var addingPopup = new ListPopup<ActorFrom>(Overlay!,
                (v, idx, s) =>
                {
                    var color = s.ToComputed(i => i == idx ? Colors.White : Colors.Black);
                    return new Text(v.DisplayName) { TextColor = color };
                }, 118, 25)
            { OnSelectionChanged = OnAddItem };
        addingPopup.DataSource = BuildActorFromList();
        addingPopup.Show(AddButton, new Offset(-4, -2), Popup.DefaultTransitionBuilder);
    }

    private void OnAddItem(ActorFrom? actorFrom) { }

    private List<ActorFrom> BuildActorFromList()
    {
        var list = new List<ActorFrom>();
        list.Add(new ActorFrom() { Source = HumanActor.ActorSource.FromAssigned, DisplayName = "指定" });
        foreach (var kv in DiagramService.WorkflowActorMethods)
        {
            list.Add(new ActorFrom()
            {
                Source = HumanActor.ActorSource.FromWorkflowActorService, 
                DisplayName = kv.Value,
                ActorMethodName = kv.Key
            });
        }

        list.Add(new ActorFrom() { Source = HumanActor.ActorSource.FromExpression, DisplayName = "表达式" });
        return list;
    }

    private sealed class ActorFrom
    {
        public required HumanActor.ActorSource Source { get; init; }
        public required string DisplayName { get; init; }
        public string? ActorMethodName { get; init; }
    }
}