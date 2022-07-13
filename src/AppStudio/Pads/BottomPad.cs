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
                    { SelectedTabColor = Colors.White, TabBarBgColor = new Color(0xFFF3F3F3) },
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
                return new DataGrid<CodeProblem>(DesignStore.ProblemsController)
                {
                    Columns = new DataGridColumn<CodeProblem>[]
                    {
                        //new DataGridTextColumn<CodeProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                        new DataGridTextColumn<CodeProblem>("Position", p => p.Position)
                            { Width = ColumnWidth.Fixed(180) },
                        new DataGridTextColumn<CodeProblem>("Message", p => p.Message),
                    }
                };
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