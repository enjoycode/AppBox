using System;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class RenameDialog : Dialog
{
    public RenameDialog(DesignStore designStore, ModelReferenceType referenceType,
        string target, string modelId, string oldName)
    {
        _designStore = designStore;
        _referenceType = referenceType;
        _target = target;
        _modelId = modelId;
        _oldName = oldName;

        Title.Value = GetTitile();
        Width = 380;
        Height = 240;
    }

    private readonly DesignStore _designStore;
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
                    new FormItem("Target:", new TextInput(_target) { Readonly = true }),
                    new FormItem("Old Name:", new TextInput(_oldName) { Readonly = true }),
                    new FormItem("New Name:", new TextInput(_newName))
                }
            }
        };
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK)
            RenameAsync();
        return base.OnClosing(result);
    }

    private async void RenameAsync()
    {
        try
        {
            var affects = await Channel.Invoke<string[]>("sys.DesignService.Rename",
                new object?[] { (int)_referenceType, _modelId, _oldName.Value, _newName.Value });
            //通知刷新受影响的节点
            _designStore.OnRenameDone(_referenceType, _modelId, affects!);
            Notification.Success("重命名成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"重命名失败: {ex.Message}");
        }
    }
}