using PixUI;

namespace AppBoxDesign;

internal sealed class BottomPad : View
{
    public BottomPad(DesignStore designStore)
    {
        _designStore = designStore;

        Child = new Container()
        {
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
                .AddTextColumn("Position", p => p.Position, 180)
                .AddTextColumn("Message", p => p.Message)
                .AddButtonColumn("Goto", (p, _) => new Button(icon: MaterialIcons.NextPlan)
                {
                    Style = ButtonStyle.Transparent,
                    Shape = ButtonShape.Pills,
                    FontSize = 20,
                    OnTap = _ => _designStore.GotoProblem(p)
                }, 80);
        }

        if (title == "Usages")
        {
            return new DataGrid<Reference>(_designStore.UsagesController)
                .AddTextColumn("Model", u => u.ModelName)
                .AddTextColumn("Location", u => u.Location)
                .AddButtonColumn("Goto", (p, _) => new Button(icon: MaterialIcons.NextPlan)
                {
                    Style = ButtonStyle.Transparent,
                    Shape = ButtonShape.Pills,
                    FontSize = 20,
                    OnTap = _ => _designStore.GotoReference(p)
                }, 80);
        }

        return new Container()
        {
            Padding = EdgeInsets.All(10),
            FillColor = Colors.White,
            Child = new Text(title),
        };
    }
}