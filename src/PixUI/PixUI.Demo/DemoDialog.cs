using System;

namespace PixUI.Demo
{
    public sealed class DemoDialog : Dialog<string>
    {
        public DemoDialog(Overlay overlay, Action<bool, string?> onClose) : base(overlay, onClose)
        {
            Width = 400;
            Height = 300;
            Title.Value = "Demo Dialog";
        }

        private readonly State<string> _result = "";

        protected override Widget BuildBody()
        {
            return new Container()
            {
                Padding = EdgeInsets.All(20),
                Child = new Column(HorizontalAlignment.Center, 20)
                {
                    Children = new Widget[]
                    {
                        new Input(_result),
                        new Row(VerticalAlignment.Middle, 20)
                        {
                            Children = new Widget[]
                            {
                                new Button("OK") { OnTap = _ => Close(false) },
                                new Button("Cancel") { OnTap = _ => Close(true) }
                            }
                        }
                    }
                }
            };
        }

        protected override string? GetResult(bool canceled) => canceled ? null : _result.Value;
    }
}