using System.Collections.Generic;
using PixUI;

namespace AppBoxDesign
{
    public sealed class HomePage : View
    {
        public HomePage()
        {
            var navigator = new Navigator(new List<Route>()
            {
                new("Login", s => new LoginPage()),
                new("IDE", s => new AppStudio()),
            });

            Child = new RouteView(navigator);
        }
    }
}