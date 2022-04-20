using PixUI;

namespace AppBoxDev
{
    public sealed class LoginPage: View
    {
        public LoginPage()
        {
            Child = new Center
            {
                Child = new Card
                {
                    Width = 400,
                    Height = 500,
                }
            };
        }

        private Widget BuildForm()
        {
            return new Column
            {
                Children = new Widget[]
                {
                    new Text("Welcome") {FontSize = 50},
                }
            };
        }
    }
}