using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class LineSeriesEditor : SingleChildWidget
{
    public LineSeriesEditor(State<CartesianSeriesSettings> state,
        DataGridController<CartesianSeriesSettings> dataGridController,
        DesignController designController)
    {
        _dataGridController = dataGridController;
        _designController = designController;

        var dataset = new RxProxy<string?>(() => state.Value.DataSet, v => state.Value.DataSet = v);
        dataset.Listen(OnDataSetChanged);
        var yField = new RxProxy<string?>(() => state.Value.Field, v => state.Value.Field = v);
        yField.Listen(v => RefreshCurrentRow());
        var smoothness = new RxProxy<double>(() => ((LineSeriesSettings)state.Value).LineSmoothness,
            v => ((LineSeriesSettings)state.Value).LineSmoothness = v);

        var allDataSet = designController.GetAllDataSet().Select(s => s.Name).ToArray();

        Child = new Form
        {
            LabelWidth = 90,
            Children =
            {
                new FormItem("DataSet", new Select<string>(dataset) { Options = allDataSet }),
                new FormItem("YField", new Select<string>(yField) { Ref = _yFieldRef }),
                new FormItem("Smoothness", new NumberInput<double>(smoothness)), //TODO: use Slider
            }
        };

        OnDataSetChanged(dataset.Value);
    }

    private readonly DesignController _designController;
    private readonly DataGridController<CartesianSeriesSettings> _dataGridController;
    private readonly WidgetRef<Select<string>> _yFieldRef = new();

    private async void OnDataSetChanged(string? dsName)
    {
        if (string.IsNullOrEmpty(dsName)) return;

        var dsState = _designController.FindState(dsName);
        var dsSettings = dsState!.Value as IDynamicDataSetStateValue;
        if (dsSettings == null) return;

        var ds = await dsSettings.GetRuntimeDataSet() as DynamicDataSet;
        if (ds == null) return;

        var numbers = ds.Fields.Where(f => f.IsNumber).Select(f => f.Name).ToArray();
        //var numbersAndDates = ds.Fields.Where(f => f.IsNumber || f.IsDateTime).Select(f => f.Name).ToArray();
        _yFieldRef.Widget!.Options = numbers;
    }

    private void RefreshCurrentRow() //TODO:待DataGrid实现绑定单元格状态后移除
    {
        _dataGridController.RefreshCurrentRow();
    }
}