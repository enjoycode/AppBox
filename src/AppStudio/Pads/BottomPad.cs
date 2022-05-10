using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign
{
    internal sealed class BottomPad : View
    {
        private readonly TabController<string> _tabController;

        public BottomPad()
        {
            _tabController = new TabController<string>(new List<string>()
            {
                "Problems", "Usages", "Output"
            });

            Child = new Column()
            {
                Children = new Widget[]
                {
                    new TabBar<string>(_tabController, BuildTab, true)
                        { Height = 40, Color = new Color(0xFFF3F3F3) },
                    new Container()
                    {
                        Height = 180,
                        Child = new TabBody<string>(_tabController, BuildBody),
                    }
                }
            };
        }

        private static void BuildTab(string title, Tab tab)
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
                Child = new Text(title) { Color = textColor }
            };
        }

        private static Widget BuildBody(string title)
        {
            return new Container()
            {
                Padding = EdgeInsets.All(10),
                Color = Colors.White,
                Child = new Text(title),
            };
        }
    }
}