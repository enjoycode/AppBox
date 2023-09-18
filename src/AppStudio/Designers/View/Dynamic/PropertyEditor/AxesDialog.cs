using System.Collections.Generic;
using AppBoxClient.Dynamic;
using PixUI;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class AxesDialog : Dialog
{
    public AxesDialog(List<AxisSettings> list, DesignController designController)
    {
        Title.Value = "Chart Axes";
        Width = 580;
        Height = 400;

        _list = list;
        _designController = designController;
        _dataGridController.DataSource = list;
        _current = _dataGridController.ObserveCurrentRow();
        _current.Value = list.Count > 0 ? list[0] : null; //select the first row
    }

    private readonly List<AxisSettings> _list;
    private readonly DesignController _designController;
    private readonly DataGridController<AxisSettings> _dataGridController = new();
    private readonly State<AxisSettings?> _current;

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
            new ButtonGroup
            {
                Children =
                {
                    new Button(icon: MaterialIcons.Add) { OnTap = _ => OnAddAxis() },
                    new Button(icon: MaterialIcons.Remove) { OnTap = _ => OnRemoveAxis() },
                    new Button(icon: MaterialIcons.ArrowUpward) /*{ OnTap = _ => OnMoveUp() }*/,
                    new Button(icon: MaterialIcons.ArrowDownward) /*{ OnTap = _ => OnMoveDown() }*/
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
                Child = new DataGrid<AxisSettings>(_dataGridController)
                {
                    Width = 250,
                    Columns =
                    {
                        new DataGridTextColumn<AxisSettings>("Name", c => c.Name ?? string.Empty),
                        new DataGridTextColumn<AxisSettings>("Labels", c => c.Labels ?? string.Empty)
                    }
                }
            },

            new Expanded(new Card
                {
                    Child = new Container
                    {
                        Child = new AxesEditor(_current, _dataGridController, _designController)
                    }
                }
            ),
        }
    };

    private void OnAddAxis()
    {
        var newAxis = new AxisSettings() { Name = "XAxis" };
        _dataGridController.Add(newAxis);
        _current.Value = newAxis; // select the new one
    }

    private void OnRemoveAxis()
    {
        if (_current.Value == null) return;

        _dataGridController.Remove(_current.Value);
        _dataGridController.TrySelectFirstRow();
    }
}