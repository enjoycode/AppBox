using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class CartesianSeriesDialog : Dialog
{
    public CartesianSeriesDialog(List<CartesianSeriesSettings> list, DesignController designController)
    {
        Title.Value = "Cartesian Series";
        Width = 580;
        Height = 400;

        _list = list;
        _designController = designController;
        _dataGridController.DataSource = list;
        _dataGridController.SelectionChanged += OnCurrentChanged;
        _current = _dataGridController.ObserveCurrentRow();
        _current.Value = list.Count > 0 ? list[0] : null; //select the first row
    }

    private readonly List<CartesianSeriesSettings> _list;
    private readonly DesignController _designController;
    private readonly State<string?> _typeName = "Line";
    private readonly DataGridController<CartesianSeriesSettings> _dataGridController = new();
    private readonly State<CartesianSeriesSettings?> _current;
    private readonly State<LineSeriesSettings> _currentLine = new LineSeriesSettings();

    protected override Widget BuildBody()
    {
        return new Container
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
    }

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
                    new Button(icon: MaterialIcons.ArrowUpward),
                    new Button(icon: MaterialIcons.ArrowDownward)
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
                                () => new LineSeriesEditor(_currentLine, _dataGridController, _designController))
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
    }

    private void OnAddSeries()
    {
        if (string.IsNullOrEmpty(_typeName.Value)) return;

        var allDataSet = _designController.GetAllDataSet();
        var firstDataSet = allDataSet.FirstOrDefault();
        switch (_typeName.Value)
        {
            case "Line":
                var lineSeries = new LineSeriesSettings();
                if (firstDataSet != null)
                    lineSeries.DataSet = firstDataSet.Name;
                _dataGridController.Add(lineSeries);
                _current.Value = lineSeries; // select the new one
                break;
        }
    }

    private void OnRemoveSeries()
    {
        if (_current.Value == null) return;

        _dataGridController.Remove(_current.Value);
        _dataGridController.TrySelectFirstRow();
    }
}