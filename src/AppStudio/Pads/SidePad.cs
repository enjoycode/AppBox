using PixUI;

namespace AppBoxDesign
{
    public enum SidePadType
    {
        DesignTree,
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
                Padding = EdgeInsets.Only(5, 0, 0, 0),
                Width = 45,
                BgColor = new Color(43, 49, 56),
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
                                    BuildButton(Icons.Filled.AccountTree, SidePadType.DesignTree),
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
                color = Compute(DesignStore.ActiveSidePad,
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
                DesignStore.ActiveSidePad.Value = type.Value;
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
                    new Container
                    {
                        Padding = EdgeInsets.All(5),
                        Width = 250, BgColor = new Color(0xFFF3F3F3),
                        Child = new Conditional<SidePadType>(DesignStore.ActiveSidePad, new[]
                        {
                            new WhenBuilder<SidePadType>(t => t == SidePadType.DesignTree,
                                () => new DesignTreePad()),
                            new WhenBuilder<SidePadType>(t => t == SidePadType.Toolbox,
                                () => new ToolboxPad()),
                            new WhenBuilder<SidePadType>(t => t == SidePadType.Settings,
                                () => new SettingsPad()),
                        }),
                    }
                }
            };
        }
    }
}