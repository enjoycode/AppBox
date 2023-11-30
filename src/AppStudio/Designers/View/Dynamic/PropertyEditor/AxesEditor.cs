using System.Collections.Generic;
using System.Linq;
using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;
using PixUI.Dynamic;
using PixUI.Dynamic.Design;

namespace AppBoxDesign.PropertyEditor;

internal sealed class AxesEditor : SingleChildWidget
{
    public AxesEditor(State<AxisSettings?> state,
        DataGridController<AxisSettings> dataGridController,
        DesignElement element)
    {
        _dataGridController = dataGridController;
        _element = element;

        var name = new RxProxy<string>(() => state.Value?.Name ?? string.Empty, v =>
        {
            if (state.Value != null) state.Value.Name = v;
        });
        var dataset = new RxProxy<string?>(() => state.Value?.DataSet, v =>
        {
            if (state.Value != null) state.Value.DataSet = v;
        });
        var labels = new RxProxy<string?>(() => state.Value?.Labels, v =>
        {
            if (state.Value != null) state.Value.Labels = v;
        });
        var labelsColor = new RxProxy<Color?>(() => state.Value?.LabelsColor, v =>
        {
            if (state.Value != null) state.Value.LabelsColor = v;
        });
        var textSize = new RxProxy<double?>(() => state.Value?.TextSize, v =>
        {
            if (state.Value != null) state.Value.TextSize = v;
        });
        var minStep = new RxProxy<double?>(() => state.Value?.MinStep, v =>
        {
            if (state.Value != null) state.Value.MinStep = v;
        });
        var forceMinStep = new RxProxy<bool>(() => state.Value?.ForceStepToMin ?? false, v =>
        {
            if (state.Value != null) state.Value.ForceStepToMin = v;
        });

        dataset.AddListener(OnDataSetChanged);
        name.AddListener(v => RefreshCurrentRow());
        labels.AddListener(v => RefreshCurrentRow());
        state.AddListener(_ =>
        {
            name.NotifyValueChanged();
            dataset.NotifyValueChanged();
            labels.NotifyValueChanged();
            labelsColor.NotifyValueChanged();
            textSize.NotifyValueChanged();
            minStep.NotifyValueChanged();
            forceMinStep.NotifyValueChanged();
        });

        var allDataSet = _element.Controller.GetAllDataSet().Select(s => s.Name).ToArray();
        var formItems = new List<FormItem>
        {
            new("Name", new TextInput(name)),
            new("DataSet", new Select<string>(dataset) { Options = allDataSet }),
            new("Labels", new Select<string>(labels) { Ref = _labelsRef }),
            new("LabelsColor", new ColorEditor(labelsColor, _element)),
            new("TextSize", new NumberInput<double>(textSize)),
            new("MinStep", new NumberInput<double>(minStep)),
            new("ForceMinStep", new Checkbox(forceMinStep)),
        };

        Child = new Form
        {
            LabelWidth = 100,
            Children = formItems,
        };

        OnDataSetChanged(dataset);
    }

    private readonly DesignElement _element;
    private readonly DataGridController<AxisSettings> _dataGridController;
    private readonly WidgetRef<Select<string>> _labelsRef = new();

    private async void OnDataSetChanged(State state)
    {
        var dsName = ((State<string?>)state).Value;
        if (string.IsNullOrEmpty(dsName)) return;

        var dsState = _element.Controller.FindState(dsName);
        var dsSettings = dsState!.Value as IDynamicDataSetStateValue;
        if (dsSettings == null) return;

        var ds = await dsSettings.GetRuntimeDataSet() as DynamicDataSet;
        if (ds == null) return;

        var strings = ds.Fields.Where(f => f.IsString).Select(f => f.Name).ToArray();
        _labelsRef.Widget!.Options = strings;
    }

    private void RefreshCurrentRow() //TODO:待DataGrid实现绑定单元格状态后移除
    {
        _dataGridController.RefreshCurrentRow();
    }
}