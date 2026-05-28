using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class HumanActionEditor : ListEditorBase<HumanAction>
{
    internal static EditorFactory Factory => (_, prop) =>
        new(new HumanActionEditor(prop), VerticalAlignment.Top);

    public HumanActionEditor(IDiagramProperty propertyItem) :
        base(propertyItem, a => a.Name) { }

    private ActivityDesigner ActivityDesigner => (ActivityDesigner)PropertyItem.DiagramItem;
    private HumanNode HumanNode => (HumanNode)ActivityDesigner.Node;

    protected override async void OnAdd()
    {
        State<string> actionName = "";
        var result = await Dialog.ShowTextInputAsync("Add HumanAction", "Name:", actionName);
        if (result != DialogResult.OK)
            return;

        //判断名称是否已存在
        if (HumanNode.Actions.Any(t => t.Name == actionName.Value))
        {
            Notification.Error($"Action already exists: {actionName.Value}");
            return;
        }

        //同步模型添加ConditionLink
        var link = new ConditionLink() { Name = actionName.Value };
        HumanNode.ResultConditions.Add(link);

        DataSources.Add(new HumanAction() { Name = actionName.Value });
        RefreshDataSources();
    }

    protected override async void OnEdit()
    {
        if (SelectedIndex.Value < 0)
            return;
        var action = DataSources[SelectedIndex.Value];
        State<string> actionName = action.Name;
        var result = await Dialog.ShowTextInputAsync("Edit HumanAction", "Name:", actionName);
        if (result != DialogResult.OK)
            return;

        if (action.Name == actionName.Value)
            return;

        //判断名称是否已存在
        if (HumanNode.Actions.Any(t => t.Name == actionName.Value))
        {
            Notification.Error($"Action already exists: {actionName.Value}");
            return;
        }

        //同步更新FlowLink和Action的名称
        var link = HumanNode.ResultConditions.Single(t => t.Name == action.Name);
        link.Name = actionName.Value;
        action.Name = actionName.Value;
        //TODO: should repaint target ActivityConnection
    }

    protected override void OnRemove()
    {
        if (SelectedIndex.Value < 0)
            return;
        var action = DataSources[SelectedIndex.Value];

        //TODO: 多人活动需要判断删除的有没有在ResultConditions的表达式内引用到，有引用则不允许删除

        //找到对应的ConditionLink
        var link = HumanNode.ResultConditions.Single(t => t.Name == action.Name);
        //从现有的连接线查找，从画布中移除
        var connections = ActivityDesigner.Surface!.GetConnections().Cast<ActivityConnection>();
        var connection = connections.SingleOrDefault(t => t.Link == link);
        connection?.Remove();
        //从ResultConditions中删除Link
        HumanNode.ResultConditions.Remove(link);
        //从HumanActions中删除
        RemoveSelected();
    }
}