using PixUI;

namespace AppBoxDesign;

internal sealed class PublishDialog : Dialog
{
    public PublishDialog(DesignHub context)
    {
        Width = 500;
        Height = 300;
        Title.Value = "Publish";

        _context = context;
    }

    private readonly DesignHub _context;
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
                .AddTextColumn("Change", t => t.ChangeType.ToString())
        };
    }

    protected override void OnMounted()
    {
        base.OnMounted();
        //开始加载变更项
        LoadChanges();
    }

    private void LoadChanges()
    {
        try
        {
            _changes = _context.GetChanges();
            _dataGridController.DataSource = _changes;
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
            await PublishCommand.Publish(_context, _changes, "commit message");
            Notification.Success("发布成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"发布失败: {ex.Message}");
        }
    }
}