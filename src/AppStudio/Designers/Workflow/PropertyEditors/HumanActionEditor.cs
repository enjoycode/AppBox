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
                    Children =
                    [
                        new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAdd() },
                        new Button(icon: MaterialIcons.Edit),
                        new Button(icon: MaterialIcons.Remove) { OnTap = _ => OnRemove() }
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

    private readonly IDiagramProperty _propertyItem;
    private readonly IList<HumanAction> _dataSources;
    private readonly ListViewController<HumanAction> _listController;
    private readonly State<int> _selectedIndex = -1;

    private async void OnAdd()
    {
        State<string> actionName = "";
        var result = await Dialog.ShowTextInputAsync("Add HumanAction", "Name:", actionName);
        if (result != DialogResult.OK)
            return;

        _dataSources.Add(new HumanAction() { Name = actionName.Value });
        RefreshDataSources();
    }

    private void OnRemove()
    {
        if (_selectedIndex.Value >= 0)
        {
            _dataSources.RemoveAt(_selectedIndex.Value);
            RefreshDataSources();
        }
    }

    private void RefreshDataSources()
    {
        _listController.DataSource = _dataSources; //TODO: use Refresh()
    }

    public override void OnPaint(ICanvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var cmdBarHeight = 35;
        var paint = Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, cmdBarHeight, W, H - cmdBarHeight), paint);

        base.OnPaint(canvas, area);
    }
}