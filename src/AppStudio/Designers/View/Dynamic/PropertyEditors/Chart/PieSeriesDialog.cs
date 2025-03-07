using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;
using DynamicTable = AppBoxCore.DynamicTable;

namespace AppBoxDesign.PropertyEditors;

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
    private Select<string> _fieldRef = null!;
    private Select<string> _nameRef = null!;

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
                    new FormItem("Field", new Select<string>(field).RefBy(ref _fieldRef)),
                    new FormItem("Name", new Select<string>(name).RefBy(ref _nameRef)),
                    new FormItem("InnerRadius", new NumberInput<double>(innerRadius)),
                }
            }
        };

        return body;
    }

    protected override void OnMounted() => FetchDataSourceFields();

    private async void FetchDataSourceFields()
    {
        _element.Data.TryGetPropertyValue(nameof(DynamicCartesianChart.DataSource), out var dataSourceValue);
        if (dataSourceValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSource");
            return;
        }

        var dsState = _element.Controller.FindState(dsName);
        if (dsState?.Value is not IDynamicTableState dsSettings) return;
        if (await dsSettings.GetRuntimeState(_element.Controller.DesignCanvas) is not DynamicTable ds) return;

        var numbers = ds.Fields.Where(f => f.IsNumber).Select(f => f.Name).ToArray();
        _fieldRef.Options = numbers;
        _nameRef.Options = ds.Fields.Select(f => f.Name).ToArray();
    }
}