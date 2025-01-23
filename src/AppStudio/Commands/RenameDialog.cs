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

        Title.Value = GetTitle();
        Width = 380;
        Height = 240;
    }

    private readonly DesignStore _designStore;
    private readonly ModelReferenceType _referenceType;
    private readonly string _modelId;
    private readonly State<string> _target;
    private readonly State<string> _oldName;
    private readonly State<string> _newName = "";

    private string GetTitle() => _referenceType switch
    {
        ModelReferenceType.EntityModel => "Rename Entity",
        ModelReferenceType.EntityMember => "Rename Entity Member",
        ModelReferenceType.ServiceModel => "Rename Service",
        ModelReferenceType.ViewModel => "Rename View",
        _ => "Rename"
    };

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
    
    protected override async ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK)
        {
            return !(await RenameAsync());
        }

        return false;
    }

    private async ValueTask<bool> RenameAsync()
    {
        try
        {
            var affects = await Rename.Execute(_modelId, _referenceType, _oldName.Value, _newName.Value);
            //通知刷新受影响的节点
            _designStore.OnRenameDone(_referenceType, _modelId, affects);
            Notification.Success("重命名成功");
            return true;
        }
        catch (Exception ex)
        {
            Notification.Error($"重命名失败: {ex.Message}");
            return false;
        }
    }
}