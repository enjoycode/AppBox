using AppBox.Reporting;
using PixUI;
using PixUI.Dynamic;

namespace AppBoxDesign.Diagram.PropertyEditors;

/// <summary>
/// 报表的数据源属性编辑器
/// </summary>
internal sealed class ReportDataSourcesEditor : SingleChildWidget
{
    public ReportDataSourcesEditor(IDiagramProperty propertyItem)
    {
        _propertyItem = propertyItem;
        _listController = new ListViewController<IDataSource>();
        _dataSources = (IList<IDataSource>)_propertyItem.ValueGetter()!;

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
                        new Button(icon: MaterialIcons.Add),
                        new Button(icon: MaterialIcons.Edit),
                        new Button(icon: MaterialIcons.Delete)
                    ]
                },

                new ListView<IDataSource>(
                    (item, index) => new DataSourceItemWidget(item, index, _selectedIndex),
                    _dataSources, _listController)
            ]
        };
    }

    private readonly IDiagramProperty _propertyItem;
    private readonly IList<IDataSource> _dataSources;
    private readonly ListViewController<IDataSource> _listController;
    private readonly State<int> _selectedIndex = -1;

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        // draw border
        var cmdBarHeight = 35;
        var paint = PixUI.Paint.Shared(Colors.Silver, PaintStyle.Stroke);
        canvas.DrawRect(Rect.FromLTWH(0, cmdBarHeight, W, H - cmdBarHeight), paint);

        base.Paint(canvas, area);
    }

    private class DataSourceItemWidget : Widget, IMouseRegion
    {
        internal DataSourceItemWidget(IDataSource item, int index, State<int> selectedState)
        {
            _item = item;
            _itemIndex = index;
            _selectedState = selectedState;
            _selectedState.AddListener(_ => Repaint());

            MouseRegion = new MouseRegion(() => Cursors.Hand);
            MouseRegion.HoverChanged += OnHoverChanged;
            MouseRegion.PointerTap += _ => _selectedState.Value = _itemIndex;
        }

        private bool _isHover;
        private readonly IDataSource _item;
        private readonly int _itemIndex;
        private readonly State<int> _selectedState;
        private Paragraph? _paragraph;

        public MouseRegion MouseRegion { get; }

        private void OnHoverChanged(bool isHover)
        {
            _isHover = isHover;
            Repaint();
        }

        public override void Layout(float availableWidth, float availableHeight)
        {
            SetSize(availableWidth, 20);
        }

        public override void Paint(Canvas canvas, IDirtyArea? area = null)
        {
            if (_selectedState.Value == _itemIndex)
                canvas.DrawRect(Rect.FromLTWH(0, 0, W, H), PixUI.Paint.Shared(Theme.FocusedColor));
            else if (_isHover)
                canvas.DrawRect(Rect.FromLTWH(0, 0, W, H), PixUI.Paint.Shared(Theme.AccentColor));

            _paragraph ??= TextPainter.BuildParagraph(_item.Name, float.PositiveInfinity,
                12, Colors.Black, null, 1, true);

            canvas.DrawParagraph(_paragraph, 2, (H - _paragraph.Height) / 2);
        }
    }

    private class ReportDataSourceDialog : Dialog
    {
        public ReportDataSourceDialog(IList<IDataSource> dataSources)
        {
            Title.Value = "Report DataSource";
            Width = 630;
            Height = 450;

            _dataSources = dataSources;

            _isFromQuery = MakeStateOfIsFromQuery();
            _isFromQuery.AddListener(_ => _tableState.Reset()); //改变数据源类型重置绑定组件的相关配置
        }

        private readonly DynamicDataTable _tableState;
        private readonly State<bool> _isFromQuery;
        private readonly IList<IDataSource> _dataSources;

        private RxProxy<bool> MakeStateOfIsFromQuery() => new(
            () => _tableState.Source.SourceType == DynamicDataTable.FromQuery,
            v =>
            {
                if (v)
                {
                    if (_tableState.Source is DataTableFromQuery)
                        return;
                    _tableState.Source = new DataTableFromQuery();
                }
                else
                {
                    if (_tableState.Source is DataTableFromService)
                        return;
                    _tableState.Source = new DataTableFromService();
                }
            });

        protected override Widget BuildFooter() => new Container
        {
            Height = Button.DefaultHeight + 20 + 20,
            Padding = EdgeInsets.All(20),
            Child = new Row(VerticalAlignment.Middle, 20)
            {
                Children =
                {
                    new Expanded(),
                    new Button("Close") { Width = 80, OnTap = _ => Close(DialogResult.OK) }
                }
            }
        };

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new Column()
                {
                    Children =
                    [
                        new Row()
                        {
                            Children =
                            [
                                new Radio(_isFromQuery),
                                new Text("From Query"),
                                new Radio(_isFromQuery.ToReversed()),
                                new Text("From Service"),
                            ]
                        },
                        // new IfConditional(_isFromQuery,
                        //     () => new DataTableFromQueryEditor(_designController, _tableState),
                        //     () => new DataTableFromServiceEditor(_designController, _tableState)
                        // )
                    ]
                }
            };
        }
    }
}