using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class CartesianSeriesDialog : Dialog
{
    public CartesianSeriesDialog(List<IDynamicCartesianSeries> list, DesignElement element)
    {
        Title.Value = "Cartesian Series";
        Width = 580;
        Height = 400;

        _list = list;
        _element = element;
        _dataGridController.DataSource = list;
        _dataGridController.SelectionChanged += OnCurrentChanged;
        _current = _dataGridController.ObserveCurrentRow();
        _current.Value = list.Count > 0 ? list[0] : null; //select the first row
    }

    private readonly List<IDynamicCartesianSeries> _list;
    private readonly DesignElement _element;
    private readonly State<string?> _typeName = "Line";
    private readonly DataGridController<IDynamicCartesianSeries> _dataGridController = new();

    private readonly State<IDynamicCartesianSeries?> _current;
    private readonly State<LineSeriesSettings> _currentLine = new LineSeriesSettings();
    private readonly State<ColumnSeriesSettings> _currentColumn = new ColumnSeriesSettings();

    #region ====Build Widget Tree====

    protected override Widget BuildBody() => new Container
    {
        Padding = EdgeInsets.All(20),
        Child = new Column(alignment: HorizontalAlignment.Left, spacing: 5)
        {
            Children =
            {
                BuildToolbar(),
                BuildContent(),
            }
        }
    };

    private Row BuildToolbar() => new Row(spacing: 5)
    {
        Children =
        {
            new Select<string>(_typeName) { Width = 180, Options = new[] { "Line", "Column" } },
            new ButtonGroup
            {
                Children =
                {
                    new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAddSeries() },
                    new Button(icon: MaterialIcons.Remove) { OnTap = _ => OnRemoveSeries() },
                    new Button(icon: MaterialIcons.ArrowUpward) { OnTap = _ => OnMoveUp() },
                    new Button(icon: MaterialIcons.ArrowDownward) { OnTap = _ => OnMoveDown() }
                }
            }
        }
    };

    private Row BuildContent() => new Row(VerticalAlignment.Top)
    {
        Children =
        {
            new Card
            {
                Child = new DataGrid<IDynamicCartesianSeries>(_dataGridController) { Width = 250 }
                    .AddTextColumn("Type", c => c.SeriesType.ToString())
                    .AddTextColumn("YField", c => c.Field)
            },

            new Expanded(new Card
                {
                    Child = new Container
                    {
                        Child = new Conditional<IDynamicCartesianSeries?>(_current)
                            .When(r => r?.SeriesType == ChartSeriesType.Line,
                                () => new LineSeriesEditor(_currentLine, _dataGridController, _element))
                            .When(r => r?.SeriesType == ChartSeriesType.Column,
                                () => new ColumnSeriesEditor(_currentColumn, _dataGridController, _element))
                    }
                }
            ),
        }
    };

    #endregion

    private void OnCurrentChanged()
    {
        if (_current.Value == null) return;

        if (_current.Value is LineSeriesSettings lineSeriesSettings)
            _currentLine.Value = lineSeriesSettings;
        else if (_current.Value is ColumnSeriesSettings columnSeriesSettings)
            _currentColumn.Value = columnSeriesSettings;
    }

    private void OnAddSeries()
    {
        if (string.IsNullOrEmpty(_typeName.Value)) return;

        IDynamicCartesianSeries? newSeries = _typeName.Value switch
        {
            "Line" => new LineSeriesSettings(),
            "Column" => new ColumnSeriesSettings(),
            _ => null
        };

        if (newSeries != null)
        {
            _dataGridController.Add(newSeries);
            _current.Value = newSeries; // select the new one
        }
    }

    private void OnRemoveSeries()
    {
        if (_current.Value == null) return;

        _dataGridController.Remove(_current.Value);
        _dataGridController.TrySelectFirstRow();
    }

    private void OnMoveUp()
    {
        var curIndex = _dataGridController.CurrentRowIndex;
        if (curIndex <= 0) return;

        var cur = _list[curIndex];
        _list.RemoveAt(curIndex);
        _list.Insert(curIndex - 1, cur);

        _dataGridController.SelectAt(curIndex - 1);
        _dataGridController.Refresh();
    }

    private void OnMoveDown()
    {
        var curIndex = _dataGridController.CurrentRowIndex;
        if (curIndex < 0 || curIndex == _list.Count - 1) return;

        var cur = _list[curIndex];
        _list.RemoveAt(curIndex);
        _list.Insert(curIndex + 1, cur);

        _dataGridController.SelectAt(curIndex + 1);
        _dataGridController.Refresh();
    }
}