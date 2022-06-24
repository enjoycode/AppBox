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

            Child = new Container()
            {
                Height = 190,
                Child = new TabView<string>(_tabController, BuildTab, BuildBody, false, 40)
                    { SelectedTabColor = Colors.White },
            };
        }

        private static Widget BuildTab(string title, State<bool> isSelected)
        {
            var textColor = RxComputed<Color>.Make(isSelected,
                selected => selected ? Theme.FocusedColor : Colors.Black
            );

            return new Text(title) { TextColor = textColor };
        }

        private static Widget BuildBody(string title)
        {
            if (title == "Problems")
            {
                return new DataGrid<CodeProblem>(DesignStore.ProblemsController);
            }

            return new Container()
            {
                Padding = EdgeInsets.All(10),
                BgColor = Colors.White,
                Child = new Text(title),
            };
        }
    }
    
}