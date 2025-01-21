using PixUI;

namespace AppBoxDesign;

public sealed class AppStudio : View
{
    public AppStudio()
    {
        Child = new Column
        {
            Children =
            {
                new MainMenuPad(_designStore),
                new Expanded
                {
                    Child = new Row
                    {
                        Children =
                        {
                            new NaviBar(_designStore),
                            new Expanded()
                            {
                                Child = new Splitter
                                {
                                    Fixed = Splitter.FixedPanel.Panel1,
                                    Distance = 250,
                                    Panel1 = new SidePad(_designStore),
                                    Panel2 = new Splitter
                                    {
                                        Orientation = Axis.Vertical,
                                        Fixed = Splitter.FixedPanel.Panel2,
                                        Distance = 190,
                                        Panel1 = new DesignerPad(_designStore),
                                        Panel2 = new BottomPad(_designStore)
                                    }
                                }
                            }
                        }
                    }
                },
                new FooterPad()
            }
        };
    }

    private readonly DesignStore _designStore = new();
}