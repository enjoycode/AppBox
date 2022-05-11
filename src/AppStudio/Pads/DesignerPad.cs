using PixUI;

namespace AppBoxDesign
{
    internal sealed class DesignerPad : View
    {
        public DesignerPad()
        {
            Child = new Column()
            {
                DebugLabel = "DesignerPad",
                Children = new Widget[]
                {
                    new TabBar<IDesignNode>(DesignStore.DesignerController, BuildTab, true)
                        { Height = 40, Color = new Color(0xFFF3F3F3) },
                    new Expanded()
                    {
                        Child = new TabBody<IDesignNode>(DesignStore.DesignerController, BuildBody),
                    }
                }
            };
        }

        private static void BuildTab(IDesignNode node, Tab tab)
        {
            var textColor = RxComputed<Color>.Make(tab.IsSelected,
                selected => selected ? Theme.FocusedColor : Colors.Black
            );
            var bgColor = RxComputed<Color>.Make(tab.IsSelected,
                selected => selected ? Colors.White : new Color(0xFFF3F3F3)
            );

            tab.Child = new Container()
            {
                Color = bgColor, Width = 100,
                Padding = EdgeInsets.Only(10, 8, 0, 0),
                Child = new Text(node.Label) { Color = textColor }
            };
        }

        private static Widget BuildBody(IDesignNode node)
        {
            return new Container()
            {
                Padding = EdgeInsets.All(10),
                Color = Colors.White,
                Child = new Text(node.Label),
            };
        }
    }
}