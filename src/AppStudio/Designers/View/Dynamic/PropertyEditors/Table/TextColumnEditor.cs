using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditors;

internal sealed class TextColumnEditor : TableColumnEditor<TextColumnSettings>
{
    public TextColumnEditor(RxObject<TextColumnSettings> obj, DesignElement element) : base(obj, element) { }

    private Select<string> _fieldRef = null!;

    protected override IEnumerable<(string, State, Widget)> GetExtProps()
    {
        var field = Column.Observe(nameof(TextColumnSettings.Field),
            s => s.Field, (s, v) => s.Field = v);
        var autoMergeCells = Column.Observe(nameof(TextColumnSettings.AutoMergeCells),
            s => s.AutoMergeCells, (s, v) => s.AutoMergeCells = v);

        yield return ("Field:", field, new Select<string>(field!).RefBy(ref _fieldRef));
        yield return ("MergeCells:", autoMergeCells, new Switch(autoMergeCells));
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
        _fieldRef.Options = fields;
    }
}