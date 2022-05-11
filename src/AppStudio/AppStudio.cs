using PixUI;

namespace AppBoxDesign
{
    public sealed class AppStudio : View
    {
        public AppStudio()
        {
            Child = new Column
            {
                Children = new Widget[]
                {
                    new MainMenuPad(),
                    new Expanded
                    {
                        Child = new Row
                        {
                            Children = new Widget[]
                            {
                                new SidePad(),
                                new Expanded()
                                {
                                    Child = new Column()
                                    {
                                        Children = new Widget[]
                                        {
                                            new Expanded() { Child = new DesignerPad() },
                                            new BottomPad(),
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
    }
}