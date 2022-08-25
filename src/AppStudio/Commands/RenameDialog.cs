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

        Title.Value = GetTitile();
        Width = 380;
        Height = 240;
    }

    private readonly ModelReferenceType _referenceType;
    private readonly string _modelId;
    private readonly State<string> _target;
    private readonly State<string> _oldName;
    private readonly State<string> _newName = "";

    private string GetTitile()
    {
        switch (_referenceType)
        {
            case ModelReferenceType.EntityModel: return "Rename Entity";
            case ModelReferenceType.EntityMember: return "Rename Entity Member";
            case ModelReferenceType.ServiceModel: return "Rename Service";
            case ModelReferenceType.ViewModel: return "Rename View";
            default: return "Rename";
        }
    }

    public string GetNewName() => _newName.Value;

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
            //通知刷新受影响的节点
            DesignStore.OnRenameDone(_referenceType, _modelId, affects!);
            Notification.Success("重命名成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"重命名失败: {ex.Message}");
        }
    }
}