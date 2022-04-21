using PixUI;

namespace AppBoxDev
{
    public sealed class LoginPage : View
    {
        private readonly State<string> _userName = "";
        private readonly State<string> _password = "";

        public LoginPage()
        {
            Child = new Center
            {
                Child = new Card { Width = 400, Height = 500, Child = BuildLoginForm() }
            };
        }

        private Widget BuildLoginForm()
        {
            return new Column
            {
                Children = new Widget[]
                {
                    new Text("Welcome") { FontSize = 50 },
                    new Input(_userName)
                    {
                        HintText = "Account",
                        Prefix = new Icon(Icons.Filled.Person)
                    },
                    new Input(_password)
                    {
                        IsObscure = true, HintText = "Password",
                        Prefix = new Icon(Icons.Filled.Lock)
                    },
                    new Button("Login")
                }
            };
        }
    }
}