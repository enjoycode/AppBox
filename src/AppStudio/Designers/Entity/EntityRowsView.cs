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

        Child = new DataGrid<DynamicEntity>(_dgController);
    }

    private readonly string _entityModelId;
    private readonly DataGridController<DynamicEntity> _dgController = new();

    protected override void OnMounted() => FetchRows();

    private async void FetchRows()
    {
        try
        {
            var ds = await Channel.Invoke<DynamicEntityList>("sys.DesignService.GetEntityRows",
                [_entityModelId, 50]);
            BuildColumns(ds!);
            _dgController.DataSource = ds;
        }
        catch (Exception e)
        {
            Notification.Error($"获取实体记录错误: {e.Message}");
        }
    }

    private void BuildColumns(DynamicEntityList ds)
    {
        _dgController.Columns.Clear();
        foreach (var field in ds.Fields)
        {
            _dgController.Columns.Add(
                new DataGridTextColumn<DynamicEntity>(field.Name, r => r[field.Name].ToStringValue())
            );
        }
    }
}