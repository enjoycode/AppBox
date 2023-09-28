using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class EntityDesigner : View, IModelDesigner
    {
        public EntityDesigner(DesignStore designStore, ModelNodeVO modelNode)
        {
            _designStore = designStore;
            ModelNode = modelNode;
            _selectedMember = _membersController.ObserveCurrentRow();

            Child = new Column()
            {
                Children = new[]
                {
                    BuildActionBar(),
                    new Expanded() { Child = BuildBody() },
                }
            };
        }

        private readonly DesignStore _designStore;
        public ModelNodeVO ModelNode { get; }
        private readonly State<int> _activePad = 0; //当前的设计面板
        private EntityModelVO? _entityModel;

        private ReferenceVO? _pendingGoto;

        private readonly DataGridController<EntityMemberVO> _membersController = new();
        private readonly State<EntityMemberVO?> _selectedMember;

        private Widget BuildActionBar() =>
            new Container()
            {
                BgColor = new Color(0xFFF5F7FA),
                Height = 45,
                Padding = EdgeInsets.All(8),
                Child = new Row(VerticalAlignment.Middle, 10)
                {
                    Children = new Widget[]
                    {
                        new ButtonGroup()
                        {
                            Children = new[]
                            {
                                new Button("Members")
                                    { Width = 75, OnTap = _ => _activePad.Value = 0 },
                                new Button("Options")
                                    { Width = 75, OnTap = _ => _activePad.Value = 1 },
                                new Button("Data") { Width = 75 },
                            }
                        },
                        new IfConditional(_activePad.ToStateOfBool(i => i == 0),
                            () => new ButtonGroup()
                            {
                                Children = new[]
                                {
                                    new Button("Add", MaterialIcons.Add)
                                        { OnTap = OnAddMember },
                                    new Button("Remove", MaterialIcons.Delete)
                                        { OnTap = OnDeleteMember },
                                    new Button("Rename", MaterialIcons.Edit)
                                        { OnTap = OnRenameMember },
                                    new Button("Usages", MaterialIcons.Link)
                                        { OnTap = OnFindUsages },
                                }
                            }),
                    }
                }
            };

        private Widget BuildBody() =>
            new FutureBuilder<EntityModelVO?>(
                Channel.Invoke<EntityModelVO>("sys.DesignService.OpenEntityModel", new object[] { ModelNode.Id }),
                (model, ex) =>
                {
                    if (ex != null)
                    {
                        Notification.Error($"无法加载实体模型: {ex.Message}");
                        return null;
                    }

                    _entityModel = model;
                    _membersController.DataSource = _entityModel!.Members
                        .Where(m => !m.IsForeignKeyMember) //暂不显示EntityRef的外键
                        .ToList();

                    if (_pendingGoto != null)
                    {
                        GotoDefinitionInternal(_pendingGoto);
                        _pendingGoto = null;
                    }

                    return new Conditional<int>(_activePad)
                        .When(t => t == 0,
                            () => new MembersDesigner(_entityModel!, _membersController, _selectedMember))
                        .When(t => t == 1,
                            () => new SqlStoreOptionsDesigner(_entityModel!, ModelNode.Id));
                }
            );

        #region ====Event Handlers====

        private async void OnAddMember(PointerEvent e)
        {
            var dlg = new NewEntityMemberDialog(_designStore, ModelNode);
            var canceled = await dlg.ShowAndWaitClose();
            if (canceled) return;

            try
            {
                var members = await Channel.Invoke<EntityMemberVO[]>(
                    "sys.DesignService.NewEntityMember", dlg.GetArgs());
                foreach (var member in members!)
                {
                    if (member.IsForeignKeyMember)
                    {
                        _entityModel!.Members.Add(member);
                        continue;
                    }

                    _membersController.Add(member);
                }
            }
            catch (Exception ex)
            {
                Notification.Error($"新建实体成员错误: {ex.Message}");
            }
        }

        private async void OnDeleteMember(PointerEvent e)
        {
            if (_selectedMember.Value == null) return;

            var args = new object?[] { ModelNode.Id, _selectedMember.Value.Name };
            try
            {
                await Channel.Invoke("sys.DesignService.DeleteEntityMember", args);

                var member = _selectedMember.Value!;
                if (member is EntityRefVO entityRef)
                {
                    //如果EntityRef同步移除相关隐藏成员
                    if (entityRef.IsAggregationRef)
                    {
                        //TODO:移除聚合类型成员
                        throw new NotImplementedException();
                    }

                    foreach (var fkMemberId in entityRef.FKMemberIds)
                    {
                        var fk = _entityModel!.Members.First(m => m.Id == fkMemberId);
                        _entityModel!.Members.Remove(fk);
                    }
                }

                _membersController.Remove(member);
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
            var dlg = new RenameDialog(_designStore, ModelReferenceType.EntityMember,
                target, ModelNode.Id, oldName);
            var canceled = await dlg.ShowAndWaitClose();
            if (canceled) return;

            //同步重命名的成员名称
            _selectedMember.Value.Name = dlg.GetNewName();
            _membersController.Refresh();
            _selectedMember.NotifyValueChanged();
        }

        private async void OnFindUsages(PointerEvent e)
        {
            if (_selectedMember.Value == null) return;

            var args = new object?[]
                { (int)ModelReferenceType.EntityMember, ModelNode.Id, _selectedMember.Value.Name };
            try
            {
                var res = await Channel.Invoke<IList<ReferenceVO>>("sys.DesignService.FindUsages",
                    args);
                _designStore.UpdateUsages(res!);
            }
            catch (Exception ex)
            {
                Notification.Error($"Delete member error: {ex.Message}");
            }
        }

        #endregion

        public Widget? GetOutlinePad() => null;

        public Widget? GetToolboxPad() => null;

        public void GotoDefinition(ReferenceVO reference)
        {
            if (string.IsNullOrEmpty(reference.Location)) return; //不需要跳转

            if (_entityModel == null)
                _pendingGoto = reference;
            else
                GotoDefinitionInternal(reference);
        }

        private void GotoDefinitionInternal(ReferenceVO reference)
        {
            //选中指定的成员
            var member = _entityModel!.Members.FirstOrDefault(m => m.Name == reference.Location);
            _selectedMember.Value = member;
        }

        public Task SaveAsync()
        {
            return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { ModelNode.Id, null });
        }

        public Task RefreshAsync()
        {
            return Task.CompletedTask; //TODO:
        }
    }
}