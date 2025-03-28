using System;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class EntityRowsView : View
{
    public EntityRowsView(string entityModelId)
    {
        _entityModelId = entityModelId;

        Child = new DataGrid<DynamicRow>(_dgController);
    }

    private readonly string _entityModelId;
    private readonly DataGridController<DynamicRow> _dgController = new();

    protected override void OnMounted() => FetchRows();

    private async void FetchRows()
    {
        try
        {
            var ds = await Channel.Invoke<DynamicTable>("sys.DesignService.GetEntityRows",
                [_entityModelId, 50]);
            BuildColumns(ds!);
            _dgController.DataSource = ds;
        }
        catch (Exception e)
        {
            Notification.Error($"获取实体记录错误: {e.Message}");
        }
    }

    private void BuildColumns(DynamicTable ds)
    {
        _dgController.Columns.Clear();
        foreach (var field in ds.Fields)
        {
            _dgController.Columns.Add(
                new DataGridTextColumn<DynamicRow>(field.Name, r => r[field.Name].ToStringValue())
            );
        }
    }
}