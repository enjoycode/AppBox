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
                new MainMenuPad(DesignStore),
                new Expanded
                {
                    Child = new Row
                    {
                        Children =
                        {
                            new NaviBar(DesignStore),
                            new Expanded()
                            {
                                Child = new Splitter
                                {
                                    Fixed = Splitter.FixedPanel.Panel1,
                                    Distance = 250,
                                    Panel1 = new SidePad(DesignStore),
                                    Panel2 = new Splitter
                                    {
                                        Orientation = Axis.Vertical,
                                        Fixed = Splitter.FixedPanel.Panel2,
                                        Distance = 190,
                                        Panel1 = new DesignerPad(DesignStore),
                                        Panel2 = new BottomPad(DesignStore)
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

    private readonly DesignStore DesignStore = new();
}