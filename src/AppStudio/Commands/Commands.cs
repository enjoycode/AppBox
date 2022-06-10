using System;
using System.Threading.Tasks;
using PixUI;

namespace AppBoxDesign
{
    public static class Commands
    {
        public static readonly Action NewViewCommand = () =>
            new NewDialog(UIWindow.Current.Overlay, "View").Show();

        public static readonly Action SaveCommand = () => Save();

        private static async Task Save()
        {
            var selectedIndex = DesignStore.DesignerController.SelectedIndex;
            if (selectedIndex < 0)
                return;

            var designer = DesignStore.DesignerController.DataSource[selectedIndex].Designer!;
            await designer.SaveAsync();
        }
    }
}