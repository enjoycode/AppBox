using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class TextColumnEditor : TableColumnEditor<TextColumnSettings>
{
    public TextColumnEditor(RxObject<TextColumnSettings> obj, DesignElement element) : base(obj, element) { }

    private readonly WidgetRef<Select<string>> _fieldRef = new();

    protected override IEnumerable<(string, State, Widget)> GetExtProps()
    {
        var field = Column.Observe(nameof(TextColumnSettings.Field),
            s => s.Field, (s, v) => s.Field = v);

        yield return ("Field:", field, new Select<string>(field!) { Ref = _fieldRef });
    }

    protected override void OnMounted() => FetchDataSetFields();

    private async void FetchDataSetFields()
    {
        Element.Data.TryGetPropertyValue(nameof(DynamicTable.DataSet), out var datasetValue);
        if (datasetValue?.Value.Value is not string dsName || string.IsNullOrEmpty(dsName))
        {
            Notification.Warn("尚未设置DataSet");
            return;
        }

        var dsState = Element.Controller.FindState(dsName);
        if (dsState?.Value is not IDynamicDataSetState dsSettings) return;
        if (await dsSettings.GetRuntimeDataSet(Element.Controller.DesignCanvas) is not DynamicDataSet ds) return;

        var fields = ds.Fields.Select(f => f.Name).ToArray();
        _fieldRef.Widget!.Options = fields;
    }
}