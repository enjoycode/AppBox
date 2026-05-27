using AppBoxCore;
using AppBoxDesign.Diagram;
using PixUI;

namespace AppBoxDesign.Workflow;

internal sealed class HumanActionEditor : SingleChildWidget
{
    public HumanActionEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;
        _listController = new ListViewController<HumanAction>();
        _dataSources = (IList<HumanAction>)_propertyItem.ValueGetter()!;

        Height = 100;

        Child = new Column()
        {
            Spacing = 5,
            Alignment = HorizontalAlignment.Left,
            Children =
            [
                new ButtonGroup()
                {
                    Height = CmdBarHeight,
                    Children =
                    [
                        new Button(icon: MaterialIcons.Add) { Width = _buttonWidth, OnTap = _ => OnAdd() },
                        new Button(icon: MaterialIcons.Edit) { Width = _buttonWidth, OnTap = _ => OnEdit() },
                        new Button(icon: MaterialIcons.Remove) { Width = _buttonWidth, OnTap = _ => OnRemove() }
                    ]
                },

                new ListView<HumanAction>(
                    (item, index) => new SelectableItem(index, _selectedIndex)
                    {
                        Child = new Text(item.Name)
                    },
                    _dataSources, _listController
                )
            ]
        };
    }

    private const float CmdBarHeight = 20;
    private readonly State<float> _buttonWidth = 20;
    private readonly IDiagramProperty _propertyItem;
    private readonly IList<HumanAction> _dataSources;
    private readonly ListViewController<HumanAction> _listController;
    private readonly State<int> _selectedIndex = -1;

    private ActivityDesigner ActivityDesigner => (ActivityDesigner)_propertyItem.DiagramItem;
    private HumanNode HumanNode => (HumanNode)ActivityDesigner.Node;

    private async void OnAdd()
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

        _dataSources.Add(new HumanAction() { Name = actionName.Value });
        RefreshDataSources();
    }

    private async void OnEdit()
    {
        if (_selectedIndex.Value < 0)
            return;
        var action = _dataSources[_selectedIndex.Value];
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

    private void OnRemove()
    {
        if (_selectedIndex.Value < 0)
            return;
        var action = _dataSources[_selectedIndex.Value];

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
        _dataSources.RemoveAt(_selectedIndex.Value);
        RefreshDataSources();
    }

    private void RefreshDataSources()
    {
        _listController.DataSource = _dataSources; //TODO: use Refresh()
    }

    public override void OnPaint(ICanvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var paint = Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, CmdBarHeight + 5, W, H - CmdBarHeight - 5), paint);

        base.OnPaint(canvas, area);
    }
}