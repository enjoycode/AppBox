using AppBox.Reporting;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using DataTableFromQuery = AppBox.ReportDataSource.DataTableFromQuery;
using DataTableFromService = AppBox.ReportDataSource.DataTableFromService;

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
                        new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAdd() },
                        new Button(icon: MaterialIcons.Edit) { OnTap = _ => OnEdit() },
                        new Button(icon: MaterialIcons.Delete) { OnTap = _ => OnDelete() }
                    ]
                },

                new ListView<IDataSource>(
                    (item, index) => new DataSourceItemWidget(item, index, _selectedIndex),
                    _dataSources, _listController
                )
            ]
        };
    }

    private readonly IDiagramProperty _propertyItem;
    private readonly IList<IDataSource> _dataSources;
    private readonly ListViewController<IDataSource> _listController;
    private readonly State<int> _selectedIndex = -1;

    #region ====Add/Edit/Delete DataSource====

    private async void OnAdd()
    {
        var dataSource = new DataTableFromQuery();
        _dataSources.Add(dataSource);
        var index = _dataSources.Count - 1;
        var dlg = new ReportDataSourceDialog(_dataSources, index);
        await dlg.ShowAsync();
        RefreshDataSources();
    }

    private async void OnEdit()
    {
        if (_selectedIndex.Value < 0) return;

        var dlg = new ReportDataSourceDialog(_dataSources, _selectedIndex.Value);
        await dlg.ShowAsync();
        RefreshDataSources();
    }

    private void OnDelete()
    {
        if (_selectedIndex.Value < 0) return;
        _dataSources.RemoveAt(_selectedIndex.Value);
        RefreshDataSources();
    }

    private void RefreshDataSources()
    {
        _listController.DataSource = _dataSources; //TODO: use Refresh()
    }

    #endregion

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

    /// <summary>
    /// 数据源编辑对话框
    /// </summary>
    private class ReportDataSourceDialog : Dialog
    {
        public ReportDataSourceDialog(IList<IDataSource> dataSources, int index)
        {
            Title.Value = "Report DataSource";
            Width = 630;
            Height = 450;

            _dataSources = dataSources;
            _index = index;
            _isFromQuery = MakeStateOfIsFromQuery();
            //_isFromQuery.AddListener(_ => _tableState.Reset());
            _name = new RxProxy<string>(
                () => _dataSources[_index].Name,
                v => _dataSources[_index].Name = v
            );
        }

        private readonly IList<IDataSource> _dataSources;
        private readonly int _index;
        private readonly State<bool> _isFromQuery;
        private readonly State<string> _name;

        private RxProxy<bool> MakeStateOfIsFromQuery() => new(
            () => _dataSources[_index] is DataTableFromQuery,
            v => _dataSources[_index] = v ? new DataTableFromQuery() : new DataTableFromService()
        );

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
                            Spacing = 2,
                            Children =
                            [
                                new Text("Name:"),
                                new TextInput(_name) { Width = 138 },
                                new Text("     "), //TODO: use blank
                                new Text("Source:"),
                                new Radio(_isFromQuery),
                                new Text("From Query"),
                                new Radio(_isFromQuery.ToReversed()),
                                new Text("From Service"),
                            ]
                        },
                        new IfConditional(_isFromQuery,
                            () => new DataTableFromQueryEditor((DataTableFromQuery)_dataSources[_index]),
                            () => new DataTableFromServiceEditor((DataTableFromService)_dataSources[_index])
                        )
                    ]
                }
            };
        }

        private class DataTableFromQueryEditor : DataTableFromQueryEditorBase
        {
            public DataTableFromQueryEditor(DataTableFromQuery tableFromQuery) : base(tableFromQuery.Wrap) { }

            protected override string[] FindStates(DynamicStateType type, bool allowNull)
            {
                throw new NotImplementedException();
            }
        }

        private class DataTableFromServiceEditor : DataTableFromServiceEditorBase
        {
            public DataTableFromServiceEditor(DataTableFromService tableFromService) : base(tableFromService.Wrap) { }

            protected override string[] FindStates(DynamicStateType type, bool allowNull)
            {
                throw new NotImplementedException();
            }
        }
    }
}