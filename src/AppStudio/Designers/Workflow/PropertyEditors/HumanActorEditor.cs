using System.Diagnostics;
using AppBoxCore;
using AppBoxDesign.Diagram;
using AppBoxStore.Entities;
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
    // private HumanNode HumanNode => (HumanNode)ActivityDesigner.Node;

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

    private async void OnAddItem(ActorFrom actorFrom)
    {
        if (actorFrom.Source == HumanActor.ActorSource.FromAssigned)
        {
            var dlg = new OrgUnitsDialog(DiagramService.OrgUnitsTree);
            var dlgResult = await dlg.ShowAsync();
            if (dlgResult == DialogResult.OK && dlg.SelectedOrgUnit != null)
            {
                var orgUnit = dlg.SelectedOrgUnit;
                var actor = new HumanActor(Expression.Constant(orgUnit.Id));
                actor.DisplayName = orgUnit.Name;
                DataSources.Add(actor);
                RefreshDataSources();
            }

            return;
        }

        if (actorFrom.Source == HumanActor.ActorSource.FromWorkflowActorService)
        {
            Debug.Assert(!string.IsNullOrEmpty(actorFrom.ActorMethodName));
            var actor = new HumanActor(Expression.Constant(actorFrom.ActorMethodName!));
            actor.DisplayName = actorFrom.DisplayName;
            DataSources.Add(actor);
            RefreshDataSources();

            return;
        }

        Notification.Error("暂未实现添加表达式");
    }

    protected override async void OnEdit()
    {
        if (SelectedIndex.Value < 0) return;

        var actor = DataSources[SelectedIndex.Value];
        if (actor.Source == HumanActor.ActorSource.FromWorkflowActorService)
            return;

        if (actor.Source == HumanActor.ActorSource.FromAssigned)
        {
            var dlg = new OrgUnitsDialog(DiagramService.OrgUnitsTree);
            var dlgResult = await dlg.ShowAsync();
            if (dlgResult == DialogResult.OK && dlg.SelectedOrgUnit != null)
            {
                var orgUnit = dlg.SelectedOrgUnit;
                actor.OrgUnitExpression = Expression.Constant(orgUnit.Id);
                actor.DisplayName = orgUnit.Name;
                RefreshDataSources();
            }

            return;
        }

        Notification.Error("暂未实现编辑表达式");
    }

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

    private readonly struct ActorFrom
    {
        public required HumanActor.ActorSource Source { get; init; }
        public required string DisplayName { get; init; }
        public string? ActorMethodName { get; init; }
    }

    private sealed class OrgUnitsDialog : Dialog
    {
        public OrgUnitsDialog(IList<OrgUnit> orgUnits)
        {
            Title.Value = "OrgUnit Picker";
            Width = 280;
            Height = 400;

            _orgUnits = orgUnits;
        }

        private readonly IList<OrgUnit> _orgUnits;
        public OrgUnit? SelectedOrgUnit { get; private set; }

        protected override Widget BuildBody() => new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new OrgUnitTreeView(_orgUnits) { OnSelected = t => SelectedOrgUnit = t }
        };
    }
}