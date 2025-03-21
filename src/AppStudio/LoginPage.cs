using AppBoxClient;
using PixUI;

namespace AppBoxDesign;

public sealed class LoginPage : View
{
#if DEBUG
    private readonly State<string> _userName = "Admin";
    private readonly State<string> _password = "760wb";
#else
    private readonly State<string> _userName = "";
    private readonly State<string> _password = "";
#endif
    private readonly State<float> _inputSize = 20;
    private readonly Image _bgImg;

    public LoginPage()
    {
        var imgData = Resources.LoadStream("Resources.LoginBG.webp");
        _bgImg = Image.FromEncodedData(imgData)!;

        Child = new Center
        {
            Child = new Card
            {
                Color = new Color(0xA8FFFFFF),
                Width = 400, Height = 330,
                Elevation = 10,
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
                Children =
                [
                    new Text("AppBox") { FontSize = 50 },
                    new TextInput(_userName)
                    {
                        HintText = "Account", FontSize = _inputSize,
                        Prefix = new Icon(MaterialIcons.Person) { Size = _inputSize },
                    },
                    new TextInput(_password)
                    {
                        IsObscure = true, HintText = "Password", FontSize = _inputSize,
                        Prefix = new Icon(MaterialIcons.Lock) { Size = _inputSize },
                    },
                    new Button("Login") { Width = 120, OnTap = e => OnLogin() }
                ]
            }
        };
    }

    private async void OnLogin()
    {
        try
        {
            await Channel.Login(_userName.Value, _password.Value);

            await DesignHub.InitAsync(Channel.SessionName, Channel.LeafOrgUnitId,
                new CheckoutService(), new StagedService(), new MetaStoreService(), new PublishService());

            CurrentNavigator!.Push("IDE"); //TODO: use Navigator.Replace?
        }
        catch (Exception ex)
        {
            Notification.Error($"登录错误: {ex.Message}");
#if DEBUG
            Console.WriteLine(ex.StackTrace);
#endif
        }
    }

    public override void Paint(Canvas canvas, IDirtyArea? area = null)
    {
        canvas.DrawImage(_bgImg, Rect.FromLTWH(0, 0, W, H));
        base.Paint(canvas, area);
    }
}