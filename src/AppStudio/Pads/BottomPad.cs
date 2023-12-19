using PixUI;

namespace AppBoxDesign;

internal sealed class BottomPad : View
{
    public BottomPad(DesignStore designStore)
    {
        _designStore = designStore;
        
        Child = new Container()
        {
            Height = 190,
            Child = new TabView<string>(_designStore.BottomPadController, BuildTab, BuildBody, false, 40)
            {
                SelectedTabColor = Colors.White, TabBarBgColor = new Color(0xFFF3F3F3)
            },
        };
    }

    private readonly DesignStore _designStore;

    private static Widget BuildTab(string title, State<bool> isSelected)
    {
        var textColor = RxComputed<Color>.Make(isSelected,
            selected => selected ? Theme.FocusedColor : Colors.Black
        );

        return new Text(title) { TextColor = textColor };
    }

    private Widget BuildBody(string title)
    {
        if (title == "Problems")
        {
            return new DataGrid<CodeProblem>(_designStore.ProblemsController)
            {
                Columns =
                {
                    //new DataGridTextColumn<CodeProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                    new DataGridTextColumn<CodeProblem>("Position", p => p.Position)
                        { Width = ColumnWidth.Fixed(180) },
                    new DataGridTextColumn<CodeProblem>("Message", p => p.Message),
                    new DataGridButtonColumn<CodeProblem>("Goto",
                        (p, _) => new Button(icon: MaterialIcons.NextPlan)
                        {
                            Style = ButtonStyle.Transparent,
                            Shape = ButtonShape.Pills,
                            FontSize = 20,
                            OnTap = _ => _designStore.GotoProblem(p)
                        },
                        ColumnWidth.Fixed(80)),
                }
            };
        }

        if (title == "Usages")
        {
            return new DataGrid<ReferenceVO>(_designStore.UsagesController)
            {
                Columns =
                {
                    new DataGridTextColumn<ReferenceVO>("Model", u => u.ModelName ?? string.Empty),
                    new DataGridTextColumn<ReferenceVO>("Location", u => u.Location ?? string.Empty),
                    new DataGridButtonColumn<ReferenceVO>("Goto",
                        (p, _) => new Button(icon: MaterialIcons.NextPlan)
                        {
                            Style = ButtonStyle.Transparent,
                            Shape = ButtonShape.Pills,
                            FontSize = 20,
                            OnTap = _ => _designStore.GotoReference(p)
                        },
                        ColumnWidth.Fixed(80))
                }
            };
        }

        return new Container()
        {
            Padding = EdgeInsets.All(10),
            FillColor = Colors.White,
            Child = new Text(title),
        };
    }
}