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

    private readonly DataGridController<PendingChange> _dataGridController = new();
    private IList<PendingChange> _changes = null!;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new DataGrid<PendingChange>(_dataGridController)
                .AddTextColumn("Type", t => t.DisplayType)
                .AddTextColumn("Name", t => t.DisplayName)
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
        //TODO: 保存所有尚未保存的内容，否则可能服务端保存的与本地不一致

        try
        {
            var hub = DesignHub.Current;
            _changes = await hub.StagedService.LoadChangesAsync();
            hub.ResolveChanges(_changes);
            _dataGridController.DataSource = _changes
                .Where(c => c.Type != StagedType.SourceCode)
                .ToList();
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

    private async void PublishAsync()
    {
        try
        {
            await Publish.Execute(_changes, "commit message");
            Notification.Success("发布成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"发布失败: {ex.Message}");
        }
    }
}