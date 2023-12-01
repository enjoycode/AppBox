using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class CartesianSeriesDialog : Dialog
{
    public CartesianSeriesDialog(List<CartesianSeriesSettings> list, DesignElement element)
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

    private readonly List<CartesianSeriesSettings> _list;
    private readonly DesignElement _element;
    private readonly State<string?> _typeName = "Line";
    private readonly DataGridController<CartesianSeriesSettings> _dataGridController = new();

    private readonly State<CartesianSeriesSettings?> _current;
    private readonly State<LineSeriesSettings> _currentLine = new LineSeriesSettings();
    private readonly State<ColumnSeriesSettings> _currentColumn = new ColumnSeriesSettings();

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
                Child = new DataGrid<CartesianSeriesSettings>(_dataGridController)
                {
                    Width = 250,
                    Columns =
                    {
                        new DataGridTextColumn<CartesianSeriesSettings>("Type", c => c.Type),
                        new DataGridTextColumn<CartesianSeriesSettings>("YField", c => c.Field)
                    }
                }
            },

            new Expanded(new Card
                {
                    Child = new Container
                    {
                        Child = new Conditional<CartesianSeriesSettings?>(_current)
                            .When(r => r?.Type == "Line",
                                () => new LineSeriesEditor(_currentLine, _dataGridController, _element))
                            .When(r => r?.Type == "Column",
                                () => new ColumnSeriesEditor(_currentColumn, _dataGridController, _element))
                    }
                }
            ),
        }
    };

    private void OnCurrentChanged()
    {
        if (_current.Value == null) return;

        if (_current.Value.Type == "Line")
            _currentLine.Value = (LineSeriesSettings)_current.Value;
        else if (_current.Value.Type == "Column")
            _currentColumn.Value = (ColumnSeriesSettings)_current.Value;
    }

    private void OnAddSeries()
    {
        if (string.IsNullOrEmpty(_typeName.Value)) return;

        CartesianSeriesSettings? newSeries = _typeName.Value switch
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