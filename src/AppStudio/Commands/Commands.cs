using System;
using PixUI;

namespace AppBoxDesign
{
    public static class Commands
    {
        public static readonly Action NewViewCommand = () =>
            new NewDialog(UIWindow.Current.Overlay, "View").Show();
    }
}