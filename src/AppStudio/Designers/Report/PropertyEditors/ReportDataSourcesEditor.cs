using AppBox.Reporting;
using AppBoxDesign.Diagram;
using PixUI;
using PixUI.Dynamic;
using DataTableFromQuery = AppBox.ReportDataSource.DataTableFromQuery;
using DataTableFromService = AppBox.ReportDataSource.DataTableFromService;

namespace AppBoxDesign.Reporting;

/// <summary>
/// 报表的数据源属性编辑器
/// </summary>
internal sealed class ReportDataSourcesEditor : ListEditorBase<IDataSource>
{
    internal static EditorFactory Factory => (ctx, prop) =>
        new(new ReportDataSourcesEditor(ctx, prop), VerticalAlignment.Top);

    public ReportDataSourcesEditor(DesignHub designContext, IDiagramProperty propertyItem)
        : base(propertyItem, d => d.Name)
    {
        _designContext = designContext;
    }

    private readonly DesignHub _designContext;

    protected override async void OnAdd()
    {
        var dataSource = new DataTableFromQuery();
        DataSources.Add(dataSource);
        var index = DataSources.Count - 1;
        var dlg = new ReportDataSourceDialog(_designContext, DataSources, index);
        await dlg.ShowAsync();
        RefreshDataSources();
    }

    protected override async void OnEdit()
    {
        if (SelectedIndex.Value < 0) return;

        var dlg = new ReportDataSourceDialog(_designContext, DataSources, SelectedIndex.Value);
        await dlg.ShowAsync();
        RefreshDataSources();
    }

    /// <summary>
    /// 数据源编辑对话框
    /// </summary>
    private class ReportDataSourceDialog : Dialog
    {
        public ReportDataSourceDialog(DesignHub designContext, IList<IDataSource> dataSources, int index)
        {
            Title.Value = "Report DataSource";
            Width = 630;
            Height = 450;

            _designContext = designContext;
            _dataSources = dataSources;
            _index = index;
            _isFromQuery = MakeStateOfIsFromQuery();
            //_isFromQuery.AddListener(_ => _tableState.Reset());
            _name = new RxProxy<string>(
                () => _dataSources[_index].Name,
                v => _dataSources[_index].Name = v
            );
        }

        private readonly DesignHub _designContext;
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
                            () => new DataTableFromQueryEditor(_designContext,
                                (DataTableFromQuery)_dataSources[_index]),
                            () => new DataTableFromServiceEditor(_designContext,
                                (DataTableFromService)_dataSources[_index])
                        )
                    ]
                }
            };
        }

        private class DataTableFromQueryEditor : DataTableFromQueryEditorBase
        {
            public DataTableFromQueryEditor(DesignHub designContext, DataTableFromQuery tableFromQuery) : base(
                designContext, tableFromQuery.Wrap) { }

            protected override string[] FindStates(DynamicStateType type, bool allowNull)
            {
                throw new NotImplementedException();
            }
        }

        private class DataTableFromServiceEditor : DataTableFromServiceEditorBase
        {
            public DataTableFromServiceEditor(DesignHub designContext, DataTableFromService tableFromService) : base(
                designContext, tableFromService.Wrap) { }

            protected override string[] FindStates(DynamicStateType type, bool allowNull)
            {
                throw new NotImplementedException();
            }
        }
    }
}