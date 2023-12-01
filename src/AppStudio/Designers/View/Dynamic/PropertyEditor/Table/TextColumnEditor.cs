using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class TextColumnEditor : SingleChildWidget
{
    public TextColumnEditor(RxObject<TextColumnSettings> obj, DesignElement element)
    {
        _element = element;
        var lable = obj.Observe(nameof(TextColumnSettings.Label),
            s => s.Label, (s, v) => s.Label = v);
        var field = obj.Observe(nameof(TextColumnSettings.Field),
            s => s.Field, (s, v) => s.Field = v);

        Child = new Form()
        {
            LabelWidth = 90,
            Children =
            {
                new("Label:", new TextInput(lable)),
                new("Field:", new Select<string>(field!) { Ref = _fieldRef })
            }
        };
    }

    private readonly DesignElement _element;
    private readonly WidgetRef<Select<string>> _fieldRef = new();

    protected override void OnMounted() => FetchDataSetFields();

    private async void FetchDataSetFields()
    {
        _element.Data.TryGetPropertyValue(nameof(DynamicTable.DataSet), out var datasetValue);
        if (datasetValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSet");
            return;
        }

        var dsState = _element.Controller.FindState(dsName);
        if (dsState?.Value is not IDynamicDataSetStateValue dsSettings) return;
        if (await dsSettings.GetRuntimeDataSet() is not DynamicDataSet ds) return;

        var fields = ds.Fields.Select(f => f.Name).ToArray();
        _fieldRef.Widget!.Options = fields;
    }
}