using PixUI;

namespace AppBoxDev
{
    public enum SidePadType
    {
        ModelsTree,
        Toolbox,
        Settings,
    }

    internal sealed class NaviBar : View
    {
        private readonly State<Color> _buttonColor = Colors.White;
        private readonly State<float> _buttonSize = 25;

        public NaviBar()
        {
            Child = new Container
            {
                Width = 45,
                Color = new Color(43, 49, 56),
                Child = new Column
                {
                    Children = new Widget[]
                    {
                        new Expanded
                        {
                            Child = new Column(HorizontalAlignment.Center, 5)
                            {
                                Children = new Widget[]
                                {
                                    BuildButton(Icons.Filled.AccountTree, SidePadType.ModelsTree),
                                    BuildButton(Icons.Filled.Build, SidePadType.Toolbox),
                                    BuildButton(Icons.Filled.Settings, SidePadType.Settings),
                                }
                            }
                        },
                        BuildButton(Icons.Filled.ArrowLeft)
                    }
                }
            };
        }

        private Button BuildButton(in IconData icon, SidePadType? type = null)
        {
            var color = _buttonColor;
            if (type != null)
                color = RxComputed<Color>.Make(DevController.ActiveSidePad,
                    s => s == type ? new Color(0xFF4AC5EA) : new Color(0xFF6A7785));

            return new Button(null, icon)
            {
                FontSize = _buttonSize,
                TextColor = color, Style = ButtonStyle.Transparent,
                OnTap = e => OnClick(type)
            };
        }

        private void OnClick(SidePadType? type)
        {
            if (type != null)
                DevController.ActiveSidePad.Value = type.Value;
        }
    }

    internal sealed class SidePad : View
    {
        public SidePad()
        {
            Child = new Row
            {
                Children = new Widget[]
                {
                    new NaviBar(),
                    new DynamicView() { Width = 350 },
                }
            };
        }
    }
}