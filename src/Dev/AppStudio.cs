using AppBoxDev.Pads;
using PixUI;

namespace AppBoxDev
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
                }
            };
        }
    }
}