using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

internal sealed class PublishDialog : Dialog
{
    public PublishDialog()
    {
        Width = 400;
        Height = 300;
        Title.Value = "Publish";
    }

    private readonly DataGridController<ChangedModel> _dataGridController =
        new DataGridController<ChangedModel>();

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new DataGrid<ChangedModel>(_dataGridController)
            {
                Columns =
                {
                    new DataGridTextColumn<ChangedModel>("ModelType", v => v.ModelType),
                    new DataGridTextColumn<ChangedModel>("ModelId", v => v.ModelId),
                }
            }
        };
    }

    protected override void OnMounted()
    {
        base.OnMounted();
        //开始加载变更项
        LoadChanges();
    }

    private async void LoadChanges()
    {
        try
        {
            var res = await Channel.Invoke<ChangedModel[]?>(
                "sys.DesignService.GetPendingChanges");
            if (res != null)
                _dataGridController.DataSource = new List<ChangedModel>(res);
        }
        catch (Exception ex)
        {
            Notification.Error($"加载模型变更失败:{ex.Message}");
        }
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK) //TODO: check no items to publish
            PublishAsync();
        return base.OnClosing(result);
    }

    private static async void PublishAsync()
    {
        try
        {
            await Channel.Invoke("sys.DesignService.Publish", new object?[] { "commit message" });
            Notification.Success("发布成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"发布失败: {ex.Message}");
        }
    }
}