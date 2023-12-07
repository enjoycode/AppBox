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
    public AxesEditor(State<ChartAxisSettings?> state,
        DataGridController<ChartAxisSettings> dataGridController,
        DesignElement element)
    {
        _dataGridController = dataGridController;
        _element = element;

        var name = new RxProxy<string>(() => state.Value?.Name ?? string.Empty, v =>
        {
            if (state.Value != null) state.Value.Name = v;
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
        
        name.AddListener(v => RefreshCurrentRow());
        labels.AddListener(v => RefreshCurrentRow());
        state.AddListener(_ =>
        {
            name.NotifyValueChanged();
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
    }

    private readonly DesignElement _element;
    private readonly DataGridController<ChartAxisSettings> _dataGridController;
    private readonly WidgetRef<Select<string>> _labelsRef = new();

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
        if (await dsSettings.GetRuntimeDataSet(_element.Controller.DesignCanvas) is not DynamicDataSet ds) return;

        var strings = ds.Fields.Where(f => f.IsString).Select(f => f.Name).ToArray();
        _labelsRef.Widget!.Options = strings;
    }

    private void RefreshCurrentRow() //TODO:待DataGrid实现绑定单元格状态后移除
    {
        _dataGridController.RefreshCurrentRow();
    }
}