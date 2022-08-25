using System;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RenameDialog : Dialog
{
    public RenameDialog(ModelReferenceType referenceType, string target, string modelId,
        string oldName)
    {
        _referenceType = referenceType;
        _target = target;
        _modelId = modelId;
        _oldName = oldName;

        SetTitile();
        Width = 380;
        Height = 240;
    }

    private readonly ModelReferenceType _referenceType;
    private readonly string _modelId;
    private readonly State<string> _target;
    private readonly State<string> _oldName;
    private readonly State<string> _newName = "";

    private void SetTitile()
    {
        if (_referenceType == ModelReferenceType.EntityMember)
            Title.Value = "Rename Entity Member";
        else
            Title.Value = "Rename";
    }

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new Form()
            {
                LabelWidth = 100,
                Children = new[]
                {
                    new FormItem("Target:", new Input(_target) { Readonly = true }),
                    new FormItem("Old Name:", new Input(_oldName) { Readonly = true }),
                    new FormItem("New Name:", new Input(_newName))
                }
            }
        };
    }

    protected override bool OnClosing(bool canceled)
    {
        if (!canceled)
            RenameAsync();
        return base.OnClosing(canceled);
    }

    private async void RenameAsync()
    {
        try
        {
            var affects = await Channel.Invoke<string[]>("sys.DesignService.Rename",
                new object?[] { (int)_referenceType, _modelId, _oldName.Value, _newName.Value });
            //TODO: 如果重命名模型，刷新模型显示文本
            //TODO: 根据返回结果刷新所有已打开的设计器

            Notification.Success("重命名成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"重命名失败: {ex.Message}");
        }
    }
}