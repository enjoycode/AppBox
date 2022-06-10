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
            Width = 400;
            Height = 300;
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
                                new Button("OK") { OnTap = _ => Close(false) },
                                new Button("Cancel") { OnTap = _ => Close(true) },
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
        }
    }
}