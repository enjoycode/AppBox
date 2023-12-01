using System;
using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal abstract class CartesianSeriesEditor<T> : SingleChildWidget where T : CartesianSeriesSettings
{
    protected CartesianSeriesEditor(State<T> state,
        DataGridController<CartesianSeriesSettings> dataGridController,
        DesignElement element)
    {
        _dataGridController = dataGridController;
        _element = element;

        var name = new RxProxy<string?>(() => state.Value.Name, v => state.Value.Name = v);
        var field = new RxProxy<string?>(() => state.Value.Field, v => state.Value.Field = v ?? string.Empty);
        field.AddListener(v => RefreshCurrentRow());

        // ReSharper disable once VirtualMemberCallInConstructor
        var extProps = GetExtProps(state).ToArray();

        state.AddListener(_ =>
        {
            name.NotifyValueChanged();
            field.NotifyValueChanged();
            foreach (var prop in extProps)
            {
                prop.Item2.NotifyValueChanged();
            }
        });

        var formItems = new List<FormItem>
        {
            new("Name", new TextInput(name.ToNoneNullable())),
            new("Field", new Select<string>(field) { Ref = _fieldRef }),
        };
        formItems.AddRange(extProps.Select(prop => new FormItem(prop.Item1, prop.Item3)));

        Child = new Form
        {
            LabelWidth = 90,
            Children = formItems,
        };
    }

    private readonly DesignElement _element;
    private readonly DataGridController<CartesianSeriesSettings> _dataGridController;
    private readonly WidgetRef<Select<string>> _fieldRef = new();

    protected virtual IEnumerable<ValueTuple<string, State, Widget>> GetExtProps(State<T> state)
    {
        yield break;
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
        if (dsState?.Value is not IDynamicDataSetStateValue dsSettings) return;
        if (await dsSettings.GetRuntimeDataSet() is not DynamicDataSet ds) return;

        var numbers = ds.Fields.Where(f => f.IsNumber).Select(f => f.Name).ToArray();
        //var numbersAndDates = ds.Fields.Where(f => f.IsNumber || f.IsDateTime).Select(f => f.Name).ToArray();
        _fieldRef.Widget!.Options = numbers;
    }

    private void RefreshCurrentRow() //TODO:待DataGrid实现绑定单元格状态后移除
    {
        _dataGridController.RefreshCurrentRow();
    }
}