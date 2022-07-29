using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    /// <summary>
    /// 通用的新建对话框(Application, Folder, 除Entity外的Model)
    /// </summary>
    public sealed class NewDialog : Dialog<string>
    {
        private readonly State<string> _name = "";
        private readonly string _type;

        public NewDialog(Overlay overlay, string type) : base(overlay)
        {
            Width = 300;
            Height = 150;
            Title.Value = $"New {type}";
            _type = type;
            OnClose = _OnClose;
        }

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new Column(HorizontalAlignment.Right, 20)
                {
                    Children = new Widget[]
                    {
                        new Input(_name) { HintText = "Please input name" },
                        new Row(VerticalAlignment.Middle, 20)
                        {
                            Children = new Widget[]
                            {
                                new Button("Cancel") { Width = 65, OnTap = _ => Close(true) },
                                new Button("OK") { Width = 65, OnTap = _ => Close(false) },
                            }
                        }
                    }
                }
            };
        }

        protected override string? GetResult(bool canceled)
            => canceled ? null : _name.Value;

        private void _OnClose(bool canceled, string? result)
        {
            if (canceled) return;
            if (string.IsNullOrEmpty(_name.Value)) return;

            var selectedNode = DesignStore.TreeController.FirstSelectedNode;
            if (selectedNode == null) return;

            var service = $"sys.DesignService.New{_type}";
            if (_type != "Application" && _type != "Folder")
                service += "Model";
            var args = _type == "Application"
                ? new object[] { _name.Value }
                : new object[] { (int)selectedNode.Data.Type, selectedNode.Data.Id, _name.Value };
            CreateAsync(service, args);
        }

        private static async void CreateAsync(string service, object[] args)
        {
            var res = await Channel.Invoke<NewNodeResult>(service, args);
            //根据返回结果同步添加新节点
            DesignStore.OnNewNode(res);
        }
    }
}