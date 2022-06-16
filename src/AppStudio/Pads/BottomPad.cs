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
                return BuildProblemsPad();
            }

            return new Container()
            {
                Padding = EdgeInsets.All(10),
                BgColor = Colors.White,
                Child = new Text(title),
            };
        }

        private static Widget BuildProblemsPad()
        {
            var controller = new DataGridController<IProblem>(new List<DataGridColumn<IProblem>>()
            {
                new DataGridTextColumn<IProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                new DataGridTextColumn<IProblem>("Position", p => p.Position,
                    ColumnWidth.Fixed(180)),
                new DataGridTextColumn<IProblem>("Info", p => p.Info),
            });

            return new DataGrid<IProblem>(controller);
        }
    }

    public interface IProblem
    {
        string Model { get; }
        string Position { get; }
        string Info { get; }
    }
}