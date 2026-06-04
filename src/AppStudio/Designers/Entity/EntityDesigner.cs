using AppBoxCore;
using PixUI;
using Log = PixUI.Log;

namespace AppBoxDesign;

internal sealed class EntityDesigner : View, IModelDesigner
{
    public EntityDesigner(DesignContext designContext, ModelNode modelNode)
    {
        _designContext = designContext;
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

    private readonly DesignContext _designContext;
    private DesignStore DesignStore => (DesignStore)_designContext.DesignUIService;
    public ModelNode ModelNode { get; }
    private readonly State<int> _activePad = 0; //当前的设计面板
    private readonly EntityModel _entityModel;

    private Reference? _pendingGoto;

    private readonly DataGridController<EntityMember> _membersController = new();
    private readonly State<EntityMember?> _selectedMember;

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
            //暂不显示EntityRef的外键及Tracker
            .Where(m => !m.IsForeignKeyMember && m.Type != EntityMemberType.EntityFieldTracker)
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
        try
        {
            var dlg = new NewEntityMemberDialog(_designContext, ModelNode);
            var dlgResult = await dlg.ShowAsync();
            if (dlgResult != DialogResult.OK) return;

            var model = (EntityModel)ModelNode.Model;
            foreach (var member in dlg.NewMembers)
            {
                model.AddMember(member);
                if (!member.IsForeignKeyMember) //暂不显示外键成员
                    _membersController.Add(member);
            }

            //保存并更新虚拟代码
            await ModelNode.SaveAsync(null);
            await _designContext.UpdateModelDocumentAsync(ModelNode);
        }
        catch (Exception ex)
        {
            Notification.Error($"新建实体成员错误: {ex.Message}");
        }
    }

    private async void OnDeleteMember(PointerEvent e)
    {
        try
        {
            if (_selectedMember.Value == null) return;

            var member = _selectedMember.Value!;
            await DeleteEntityMember.Execute(_designContext, ModelNode, member);

            _membersController.Remove(member);

            //保存并更新虚拟代码
            await ModelNode.SaveAsync(null);
            await _designContext.UpdateModelDocumentAsync(ModelNode);
        }
        catch (Exception ex)
        {
            Notification.Error($"Delete member error: {ex.Message}");
        }
    }

    private async void OnRenameMember(PointerEvent e)
    {
        if (_selectedMember.Value == null) return;

        var oldName = _selectedMember.Value.Name;
        var target = $"{ModelNode.Label}.{oldName}";
        var dlg = new RenameDialog(_designContext, ModelReferenceType.EntityMember, target, ModelNode.Id, oldName);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        //刷新重命名的成员名称
        _membersController.RefreshCurrentRow();
        _selectedMember.NotifyValueChanged();
    }

    private async void OnFindUsages(PointerEvent e)
    {
        try
        {
            if (_selectedMember.Value == null) return;

            var list = await FindUsagesCommand.Find(_designContext, ModelReferenceType.EntityMember,
                ModelNode, _selectedMember.Value.Name);
            DesignStore.UpdateUsages(list);
        }
        catch (Exception ex)
        {
            Notification.Error($"Find usages error: {ex.Message}");
            Log.Debug(ex.StackTrace ?? string.Empty);
        }
    }

    #endregion

    public Widget? GetOutlinePad() => null;

    public Widget? GetToolboxPad() => null;

    public void GotoLocation(ILocation location)
    {
        if (string.IsNullOrEmpty(location.Location)) return; //不需要跳转

        // if (_entityModel == null)
        //     _pendingGoto = reference;
        // else
        GotoDefinitionInternal(location);
    }

    private void GotoDefinitionInternal(ILocation location)
    {
        //选中指定的成员
        var member = _entityModel.Members.FirstOrDefault(m => m.Name == location.Location);
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