using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class PieSeriesDialog : Dialog
{
    public PieSeriesDialog(PieSeriesSettings state, DesignElement element)
    {
        Title.Value = "Pie Series";
        Width = 400;
        Height = 300;

        _state = state;
        _element = element;
    }

    private readonly PieSeriesSettings _state;
    private readonly DesignElement _element;
    private readonly WidgetRef<Select<string>> _fieldRef = new();
    private readonly WidgetRef<Select<string>> _nameRef = new();

    protected override Widget BuildBody()
    {
        var field = new RxProxy<string?>(() => _state.Field, v => _state.Field = v ?? string.Empty);
        var name = new RxProxy<string?>(() => _state.Name, v => _state.Name = v);
        var innerRadius = new RxProxy<double?>(() => _state.InnerRadius, v => _state.InnerRadius = v);
        
        var body = new Container
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                Children =
                {
                    new FormItem("Field", new Select<string>(field) { Ref = _fieldRef }),
                    new FormItem("Name", new Select<string>(name) { Ref = _nameRef }),
                    new FormItem("InnerRadius", new NumberInput<double>(innerRadius)),
                }
            }
        };
        
        return body;
    }

    protected override void OnMounted() => FetchDataSetFields();

    private async void FetchDataSetFields()
    {
        _element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSet), out var datasetValue);
        if (datasetValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSet");
            return;
        }

        var dsState = _element.Controller.FindState(dsName);
        if (dsState?.Value is not IDynamicDataSetState dsSettings) return;
        if (await dsSettings.GetRuntimeDataSet() is not DynamicDataSet ds) return;

        var numbers = ds.Fields.Where(f => f.IsNumber).Select(f => f.Name).ToArray();
        _fieldRef.Widget!.Options = numbers;
        _nameRef.Widget!.Options = ds.Fields.Select(f => f.Name).ToArray();
    }
}