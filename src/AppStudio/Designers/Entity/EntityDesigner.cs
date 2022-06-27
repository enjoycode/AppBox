using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class EntityDesigner : View, IDesigner
    {
        public EntityDesigner(ModelNode modelNode)
        {
            _modelNode = modelNode;

            Child = new Column()
            {
                Children = new Widget[]
                {
                    BuildActionBar(),
                    new Expanded()
                    {
                        Child = new Conditional<int>(_activePad, new[]
                        {
                            new WhenBuilder<int>(t => t == 0,
                                () => new MembersDesigner(_membersController)),
                        })
                    },
                }
            };
        }

        private readonly ModelNode _modelNode;
        private readonly State<int> _activePad = 0;
        private bool _hasLoad = false;
        private EntityModelVO? _entityModel;

        private readonly DataGridController<EntityMemberVO> _membersController =
            new DataGridController<EntityMemberVO>();

        private Widget BuildActionBar()
        {
            return new Container()
            {
                BgColor = Colors.White, Height = 40,
                Padding = EdgeInsets.Only(15, 8, 15, 8),
                Child = new Row(VerticalAlignment.Middle, 10)
                {
                    Children = new Widget[]
                    {
                        new Text(GetDataStoreKindString()) { Width = 120 },
                        new Button("Members") { Width = 75 },
                        new Button("Options") { Width = 75 },
                        new Button("Data") { Width = 75 },
                    }
                }
            };
        }

        private string GetDataStoreKindString()
        {
            if (_entityModel == null) return string.Empty;

            return $"{_entityModel!.DataStoreKind.ToString()}Store";
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
                _entityModel = (EntityModelVO)await Channel.Invoke(
                    "sys.DesignService.OpenEntityModel",
                    new object[] { _modelNode.Id });
                _membersController.DataSource = _entityModel!.Members;
            }
            catch (Exception e)
            {
                Notification.Error("无法加载实体模型");
            }
        }

        public Task SaveAsync()
        {
            throw new System.NotImplementedException();
        }
    }
}