using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 通用的新建对话框(Application, Folder, 除Entity外的Model)
/// </summary>
internal sealed class NewDialog : Dialog
{
    public NewDialog(DesignStore designStore, string type)
    {
        _designStore = designStore;
        Width = 300;
        Height = 180;
        Title.Value = $"New {type}";
        _type = type;
    }

    private readonly DesignStore _designStore;
    private readonly State<string> _name = "";
    private readonly string _type;

    protected override Widget BuildBody()
    {
        return new Container()
        {
            Padding = EdgeInsets.All(20),
            Child = new TextInput(_name) { HintText = "Please input name" }
        };
    }

    protected override ValueTask<bool> OnClosing(string result)
    {
        if (result == DialogResult.OK && !string.IsNullOrEmpty(_name.Value))
            CreateAsync();
        return base.OnClosing(result);
    }

    private async void CreateAsync()
    {
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        NewNodeResult res;
        switch (_type)
        {
            case "Folder":
                res = await NewFolder.Execute(selectedNode.Data, _name.Value);
                break;
            case "Service":
                res = await NewServiceModel.Execute(selectedNode.Data, _name.Value);
                break;
            case "Permission":
                res = await NewPermissionModel.Execute(selectedNode.Data, _name.Value);
                break;
            default:
                throw new NotImplementedException(_type);
        }

        //根据返回结果同步添加新节点
        res.ResolveToTree(_designStore);
        _designStore.OnNewNode(res!);
    }
}