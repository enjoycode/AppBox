using PixUI;

namespace AppBoxDesign.Diagram;

internal abstract class ListEditorBase<T> : SingleChildWidget
{
    protected ListEditorBase(IDiagramProperty propertyItem, Func<T, string> nameGetter)
    {
        PropertyItem = propertyItem;
        _listController = new ListViewController<T>();
        DataSources = (IList<T>)PropertyItem.ValueGetter()!;
        if (DataSources.Count > 0) SelectedIndex.Value = 0; //默认选择第一项

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
                        new Button(icon: MaterialIcons.Add)
                            { Width = _buttonWidth, OnTap = _ => OnAdd() }.RefBy(ref AddButton),
                        new Button(icon: MaterialIcons.Edit) { Width = _buttonWidth, OnTap = _ => OnEdit() },
                        new Button(icon: MaterialIcons.Remove) { Width = _buttonWidth, OnTap = _ => OnRemove() }
                    ]
                },

                new ListView<T>(
                    (item, index) => new SelectableItem(index, SelectedIndex)
                    {
                        Child = new Text(nameGetter(item))
                    },
                    DataSources, _listController
                )
            ]
        };
    }

    private const float CmdBarHeight = 20;
    private readonly State<float> _buttonWidth = 20;
    protected readonly Button AddButton = null!;
    protected readonly IDiagramProperty PropertyItem;
    protected readonly IList<T> DataSources;
    private readonly ListViewController<T> _listController;
    protected readonly State<int> SelectedIndex = -1;

    protected virtual void OnAdd() { }

    protected virtual void OnEdit() { }

    protected virtual void OnRemove() => RemoveSelected();

    protected void RemoveSelected()
    {
        if (SelectedIndex.Value < 0)
            return;

        DataSources.RemoveAt(SelectedIndex.Value);
        if (SelectedIndex.Value > 0)
            SelectedIndex.Value--;
        RefreshDataSources();
    }

    protected void RefreshDataSources()
    {
        _listController.DataSource = DataSources; //TODO: use Refresh()
    }

    public override void OnPaint(ICanvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var paint = Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, CmdBarHeight + 5, W, H - CmdBarHeight - 5), paint);

        base.OnPaint(canvas, area);
    }
}