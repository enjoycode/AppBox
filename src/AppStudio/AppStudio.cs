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
                            new SidePad(DesignStore),
                            new Expanded()
                            {
                                Child = new Column()
                                {
                                    Children =
                                    {
                                        new Expanded() { Child = new DesignerPad(DesignStore) },
                                        new BottomPad(DesignStore),
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

    internal readonly DesignStore DesignStore = new();
}