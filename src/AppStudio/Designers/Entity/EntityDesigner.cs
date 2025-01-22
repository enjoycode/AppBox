using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class EntityDesigner : View, IModelDesigner
{
    public EntityDesigner(DesignStore designStore, ModelNode modelNode)
    {
        _designStore = designStore;
        ModelNode = modelNode;
        _entityModel = (EntityModel)ModelNode.Model;
        _selectedMember = _membersController.ObserveCurrentRow();

        Child = new Column()
        {
            Children =
            {
                BuildActionBar(),
                new Expanded() { Child = BuildBody() },
            }
        };
    }

    private readonly DesignStore _designStore;
    public ModelNode ModelNode { get; }
    private readonly State<int> _activePad = 0; //当前的设计面板
    private readonly EntityModel _entityModel;

    private Reference? _pendingGoto;

    private readonly DataGridController<EntityMemberModel> _membersController = new();
    private readonly State<EntityMemberModel?> _selectedMember;

    private Container BuildActionBar() => new Container
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
                        new Button("Members") { Width = 75, OnTap = _ => _activePad.Value = 0 },
                        new Button("Options") { Width = 75, OnTap = _ => _activePad.Value = 1 },
                        new Button("Data") { Width = 75, OnTap = _ => _activePad.Value = 2 },
                    }
                },
                new IfConditional(_activePad.ToStateOfBool(i => i == 0), () => new ButtonGroup
                {
                    Children =
                    {
                        new Button("Add", MaterialIcons.Add) { OnTap = OnAddMember },
                        new Button("Remove", MaterialIcons.Delete) { OnTap = OnDeleteMember },
                        new Button("Rename", MaterialIcons.Edit) { OnTap = OnRenameMember },
                        new Button("Usages", MaterialIcons.Link) { OnTap = OnFindUsages },
                    }
                }),
            }
        }
    };

    private Widget BuildBody()
    {
        _membersController.DataSource = _entityModel.Members
            .Where(m => !m.IsForeignKeyMember) //暂不显示EntityRef的外键
            .ToList();

        if (_pendingGoto != null)
        {
            GotoDefinitionInternal(_pendingGoto);
            _pendingGoto = null;
        }

        return new Conditional<int>(_activePad)
            .When(t => t == 0,
                () => new MembersDesigner(_entityModel, _membersController, _selectedMember))
            .When(t => t == 1,
                () => new SqlStoreOptionsDesigner(ModelNode, ModelNode.Id))
            .When(t => t == 2,
                () => new EntityRowsView(ModelNode.Id));
    }

    #region ====Event Handlers====

    private async void OnAddMember(PointerEvent e)
    {
        var dlg = new NewEntityMemberDialog(_designStore, ModelNode);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        try
        {
            var members = dlg.GetNewMembers();
            foreach (var member in members)
            {
                if (!member.IsForeignKeyMember)
                    _membersController.Add(member);
            }

            //保存并更新虚拟代码
            await ModelNode.SaveAsync(null);
            await DesignHub.Current.TypeSystem.UpdateModelDocumentAsync(ModelNode);
        }
        catch (Exception ex)
        {
            Notification.Error($"新建实体成员错误: {ex.Message}");
        }
    }

    private async void OnDeleteMember(PointerEvent e)
    {
        if (_selectedMember.Value == null) return;

        try
        {
            var member = _selectedMember.Value!;
            await DeleteEntityMember.Execute(ModelNode, member);

            _membersController.Remove(member);

            //保存并更新虚拟代码
            await ModelNode.SaveAsync(null);
            await DesignHub.Current.TypeSystem.UpdateModelDocumentAsync(ModelNode);
        }
        catch (Exception ex)
        {
            Notification.Error($"Delete member error: {ex.Message}");
        }
    }

    private async void OnRenameMember(PointerEvent e)
    {
        throw new NotImplementedException(nameof(OnRenameMember));
        // if (_selectedMember.Value == null) return;
        //
        // var oldName = _selectedMember.Value.Name;
        // var target = $"{ModelNode.Label}.{oldName}";
        // var dlg = new RenameDialog(_designStore, ModelReferenceType.EntityMember,
        //     target, ModelNode.Id, oldName);
        // var dlgResult = await dlg.ShowAsync();
        // if (dlgResult != DialogResult.OK) return;
        //
        // //同步重命名的成员名称
        // _selectedMember.Value.Name = dlg.GetNewName();
        // _membersController.Refresh();
        // _selectedMember.NotifyValueChanged();
    }

    private async void OnFindUsages(PointerEvent e)
    {
        if (_selectedMember.Value == null) return;

        try
        {
            var list = await FindUsages.Execute(ModelReferenceType.EntityMember, ModelNode, _selectedMember.Value.Name);
            _designStore.UpdateUsages(list);
        }
        catch (Exception ex)
        {
            Notification.Error($"Find usages error: {ex.Message}");
        }
    }

    #endregion

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => null;

    public void GotoDefinition(Reference reference)
    {
        if (string.IsNullOrEmpty(reference.Location)) return; //不需要跳转

        // if (_entityModel == null)
        //     _pendingGoto = reference;
        // else
        GotoDefinitionInternal(reference);
    }

    private void GotoDefinitionInternal(Reference reference)
    {
        //选中指定的成员
        var member = _entityModel.Members.FirstOrDefault(m => m.Name == reference.Location);
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
}