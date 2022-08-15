using System;
using System.Threading.Tasks;
using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class EntityDesigner : View, IDesigner
    {
        public EntityDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;
            _membersController.SelectionChanged += OnMemberSelectionChanged;

            Child = new Column()
            {
                Children = new[]
                {
                    BuildActionBar(),
                    new Expanded()
                    {
                        //TODO: use FutureBuilder
                        Child = new IfConditional(_loaded, () =>
                            new Conditional<int>(_activePad)
                                .When(t => t == 0,
                                    () => new MembersDesigner(_entityModel!, _membersController,
                                        _selectedMember))
                                .When(t => t == 1,
                                    () => new SqlStoreOptionsDesigner(_entityModel!, _modelNode.Id))
                        )
                    },
                }
            };
        }

        private readonly ModelNode _modelNode;
        private readonly State<int> _activePad = 0; //当前的设计面板
        private bool _hasLoad = false;
        private readonly State<bool> _loaded = false;
        private EntityModelVO? _entityModel;
        internal ModelNode ModelNode => _modelNode;

        private readonly DataGridController<EntityMemberVO> _membersController = new();
        private readonly State<EntityMemberVO?> _selectedMember = new Rx<EntityMemberVO?>(null);

        private Widget BuildActionBar()
        {
            return new Container()
            {
                BgColor = new Color(0xFFF5F7FA), Height = 45,
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
                        new IfConditional(_activePad.AsStateOfBool(i => i == 0),
                            () => new ButtonGroup()
                            {
                                Children = new[]
                                {
                                    new Button("Add", Icons.Filled.Add) { OnTap = OnAddMember },
                                    new Button("Remove", Icons.Filled.Delete)
                                        { OnTap = OnDeleteMember },
                                    new Button("Rename", Icons.Filled.Edit),
                                    new Button("Usages", Icons.Filled.Link),
                                }
                            }),
                    }
                }
            };
        }

        protected override void OnMounted()
        {
            base.OnMounted();
            TryLoadEntityModel();
        }

        private async void TryLoadEntityModel()
        {
            if (_hasLoad) return;
            _hasLoad = true;

            try
            {
                _entityModel = await Channel.Invoke<EntityModelVO>(
                    "sys.DesignService.OpenEntityModel",
                    new object[] { _modelNode.Id });
                _membersController.DataSource = _entityModel!.Members;
                _loaded.Value = true;
            }
            catch (Exception e)
            {
                Notification.Error("无法加载实体模型");
            }
        }

        #region ====Event Handlers====

        private void OnMemberSelectionChanged()
        {
            _selectedMember.Value = _membersController.SelectedRows.Length == 0
                ? null
                : _membersController.SelectedRows[0];
        }

        private async void OnAddMember(PointerEvent e)
        {
            var dlg = new NewEntityMemberDialog();
            var canceled = await dlg.ShowAndWaitClose();
            if (canceled) return;

            var memberType = dlg.GetMemberTypeValue();
            object?[] args;
            if (memberType == (int)EntityMemberType.EntityField)
                args = new object?[]
                {
                    _modelNode.Id, dlg.Name.Value, memberType, dlg.GetFieldTypeValue(),
                    dlg.AllowNull.Value
                };
            else if (memberType == (int)EntityMemberType.EntityRef)
                args = new object?[]
                {
                    //TODO:暂不支持聚合引用
                    _modelNode.Id, dlg.Name.Value, memberType, dlg.GetRefModelIds(),
                    dlg.AllowNull.Value
                };
            else
                throw new NotImplementedException();

            try
            {
                var member = await Channel.Invoke<EntityMemberVO>(
                    "sys.DesignService.NewEntityMember", args);
                _membersController.Add(member!);
            }
            catch (Exception ex)
            {
                Notification.Error($"新建实体成员错误: {ex.Message}");
            }
        }

        private async void OnDeleteMember(PointerEvent e)
        {
            if (_selectedMember.Value == null) return;

            var args = new object?[] { _modelNode.Id, _selectedMember.Value.Name };
            try
            {
                await Channel.Invoke("sys.DesignService.DeleteEntityMember", args);
                //TODO: 如果EntityRef移除相关隐藏成员
                _membersController.Remove(_selectedMember.Value);
            }
            catch (Exception ex)
            {
                Notification.Error($"Delete member error: {ex.Message}");
            }
        }

        #endregion

        public Task SaveAsync()
        {
            return Channel.Invoke("sys.DesignService.SaveModel", new object?[] { _modelNode.Id });
        }
    }
}