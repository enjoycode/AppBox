using System;
using System.Threading.Tasks;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    public sealed class LoginPage : View
    {
        private readonly State<string> _userName = "";
        private readonly State<string> _password = "";
        private readonly State<float> _inputSize = 20;

        public LoginPage()
        {
            Child = new Center
            {
                Child = new Card
                {
                    Width = 400, Height = 330,
                    Elevation = 20,
                    Child = BuildLoginForm()
                }
            };
        }

        private Widget BuildLoginForm()
        {
            return new Container
            {
                Padding = EdgeInsets.All(30),
                Child = new Column(HorizontalAlignment.Center, 30)
                {
                    Children = new Widget[]
                    {
                        new Text("Welcome") { FontSize = 50 },
                        new Input(_userName)
                        {
                            HintText = "Account", FontSize = _inputSize,
                            Prefix = new Icon(Icons.Filled.Person) { Size = _inputSize },
                        },
                        new Input(_password)
                        {
                            IsObscure = true, HintText = "Password", FontSize = _inputSize,
                            Prefix = new Icon(Icons.Filled.Lock) { Size = _inputSize },
                        },
                        new Button("Login") { OnTap = e => OnLogin() }
                    }
                }
            };
        }

        private async Task OnLogin()
        {
            // try
            // {
                await Channel.Login(_userName.Value, _password.Value);

                CurrentNavigator!.PushNamed("IDE");
            // }
            // catch (Exception ex) { }
        }
    }
}