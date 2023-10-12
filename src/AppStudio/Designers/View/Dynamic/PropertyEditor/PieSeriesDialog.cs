using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesDialog : Dialog
{
    public PieSeriesDialog(PieSeriesSettings state, DesignController designController)
    {
        Title.Value = "Pie Series";
        Width = 400;
        Height = 300;

        _state = state;
        _designController = designController;
    }

    private readonly PieSeriesSettings _state;
    private readonly DesignController _designController;
    private readonly WidgetRef<Select<string>> _yFieldRef = new();
    private readonly WidgetRef<Select<string>> _nameRef = new();

    // ReSharper disable once NotAccessedField.Local
    private IStateBindable _datasetListner;

    protected override Widget BuildBody()
    {
        var dataset = new RxProxy<string?>(() => _state.DataSet, v => _state.DataSet = v ?? string.Empty);
        _datasetListner = dataset.Listen(OnDataSetChanged);
        var yField = new RxProxy<string?>(() => _state.Field, v => _state.Field = v ?? string.Empty);
        var name = new RxProxy<string?>(() => _state.Name, v => _state.Name = v);
        var innerRadius = new RxProxy<double?>(() => _state.InnerRadius, v => _state.InnerRadius = v);

        var allDataSet = _designController.GetAllDataSet().Select(s => s.Name).ToArray();
        var body = new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                Children =
                {
                    new FormItem("DataSet", new Select<string>(dataset) { Options = allDataSet }),
                    new FormItem("Field", new Select<string>(yField) { Ref = _yFieldRef }),
                    new FormItem("Name", new Select<string>(name) { Ref = _nameRef }),
                    new FormItem("InnerRadius", new NumberInput<double>(innerRadius)),
                }
            }
        };

        OnDataSetChanged(_state.DataSet);
        return body;
    }

    private async void OnDataSetChanged(string? dsName)
    {
        if (string.IsNullOrEmpty(dsName)) return;

        var dsState = _designController.FindState(dsName);
        var dsSettings = dsState!.Value as IDynamicDataSetStateValue;
        if (dsSettings == null) return;

        var ds = await dsSettings.GetRuntimeDataSet() as DynamicDataSet;
        if (ds == null) return;

        var numbers = ds.Fields.Where(f => f.IsNumber).Select(f => f.Name).ToArray();
        _yFieldRef.Widget!.Options = numbers;
        _nameRef.Widget!.Options = ds.Fields.Select(f => f.Name).ToArray();
    }
}