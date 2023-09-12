using System.Collections.Generic;
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
        _current = _dataGridController.ObserveCurrentRow();
    }

    private readonly List<CartesianSeriesSettings> _list;
    private readonly DesignController _designController;
    private readonly State<string?> _typeName = "Line";
    private readonly DataGridController<CartesianSeriesSettings> _dataGridController = new();
    private readonly State<CartesianSeriesSettings?> _current;

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
                    new Button(icon: MaterialIcons.Add),
                    new Button(icon: MaterialIcons.Remove),
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
                                () => new LineSeriesEditor(_current!, _dataGridController, _designController))
                    }
                }
            ),
        }
    };
}