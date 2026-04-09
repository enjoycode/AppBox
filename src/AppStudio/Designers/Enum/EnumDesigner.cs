using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class EnumDesigner : View, IModelDesigner
{
    public EnumDesigner(DesignStore designStore, ModelNode modelNode)
    {
        _designStore = designStore;
        ModelNode = modelNode;
        _enumModel = (EnumModel)ModelNode.Model;
        _selectedMember = _membersController.ObserveCurrentRow();
        _membersController.DataSource = _enumModel.Items;

        Child = new Column()
        {
            Children =
            [
                BuildActionBar(),
                new Expanded() { Child = BuildBody() },
            ]
        };
    }

    private readonly DesignStore _designStore;
    public ModelNode ModelNode { get; }
    private readonly EnumModel _enumModel;
    private readonly DataGridController<EnumItem> _membersController = new();
    private readonly State<EnumItem?> _selectedMember;

    private Container BuildActionBar() => new()
    {
        FillColor = new Color(0xFFF5F7FA),
        Height = 45,
        Padding = EdgeInsets.All(8),
        Child = new Row(VerticalAlignment.Middle, 10)
        {
            Children =
            {
                new ButtonGroup
                {
                    Children =
                    {
                        new Button("Add", MaterialIcons.Add) { OnTap = _ => OnAddItem() },
                        new Button("Remove", MaterialIcons.Delete),
                        new Button("Rename", MaterialIcons.Edit),
                        new Button("Usages", MaterialIcons.Link),
                    }
                },
            }
        }
    };

    private Widget BuildBody() => new DataGrid<EnumItem>(_membersController)
        .AddTextColumn("Name", item => item.Name, width: 200)
        .AddNumberInputColumn("Value", item => item.Value, (item, value) => item.Value = value, width: 180)
        .AddTextInputColumn("Comment", item => item.Comment ?? string.Empty, (item, comment) => item.Comment = comment);

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => null;

    public void GotoLocation(ILocation location)
    {
        if (string.IsNullOrEmpty(location.Location)) return; //不需要跳转

        GotoDefinitionInternal(location);
    }

    private void GotoDefinitionInternal(ILocation location)
    {
        //选中指定的成员
        var member = _enumModel.Items.FirstOrDefault(m => m.Name == location.Location);
        _selectedMember.Value = member;
    }

    public Task SaveAsync()
    {
        return ModelNode.SaveAsync(null);
    }

    public Task RefreshAsync()
    {
        return Task.CompletedTask; //TODO:
    }

    void IDesigner.OnClose() { }

    private async void OnAddItem()
    {
        var dlg = new NewEnumItemDialog(_enumModel);
        var result = await dlg.ShowAsync();
        if (result != DialogResult.OK)
            return;

        var item = dlg.GetEnumItem();
        if (!CodeUtil.IsValidIdentifier(item.Name) || _enumModel.Items.Any(e => e.Name == item.Name))
        {
            Notification.Error("Invalid name");
            return;
        }

        try
        {
            _enumModel.AddItem(item);
            _membersController.Refresh();
            //保存并更新虚拟代码
            await ModelNode.SaveAsync(null);
            await DesignHub.Current.TypeSystem.UpdateModelDocumentAsync(ModelNode);
        }
        catch (Exception e)
        {
            Notification.Error($"Create EnumItem error: {e.Message}");
        }
    }
}