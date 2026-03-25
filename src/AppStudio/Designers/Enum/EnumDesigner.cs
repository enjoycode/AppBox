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

        Child = new Column()
        {
            Children =
            [
                BuildActionBar(),
                new Expanded() { Child = new Container() },
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
                        new Button("Add", MaterialIcons.Add),
                        new Button("Remove", MaterialIcons.Delete),
                        new Button("Rename", MaterialIcons.Edit),
                        new Button("Usages", MaterialIcons.Link),
                    }
                },
            }
        }
    };

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
}