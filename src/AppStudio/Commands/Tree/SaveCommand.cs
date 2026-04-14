using PixUI;

namespace AppBoxDesign;

internal sealed class SaveCommand : DesignCommand
{
    public SaveCommand(DesignHub context) : base(context) { }

    public async void Execute()
    {
        try
        {
            var designer = DesignStore.ActiveDesigner;
            if (designer == null) return;

            await designer.SaveAsync();
            Notification.Success("保存成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"保存失败: {ex.Message}");
        }
    }
}