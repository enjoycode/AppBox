import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class LoginPage extends PixUI.View {
    private readonly _userName: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _password: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _inputSize: PixUI.State<number> = PixUI.State.op_Implicit_From(20);

    public constructor() {
        super();
        this.Child = new PixUI.Center
        ().Init({
            Child: new PixUI.Card
            ().Init({
                    Width: PixUI.State.op_Implicit_From(400),
                    Height: PixUI.State.op_Implicit_From(330),
                    Elevation: PixUI.State.op_Implicit_From(20),
                    Child: this.BuildLoginForm()
                }
            )
        });
    }

    private BuildLoginForm(): PixUI.Widget {
        return new PixUI.Container
        ().Init({
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(30)),
            Child: new PixUI.Column(PixUI.HorizontalAlignment.Center, 30).Init({
                    Children: [new PixUI.Text(PixUI.State.op_Implicit_From("Welcome")).Init({FontSize: PixUI.State.op_Implicit_From(50)}), new PixUI.Input(this._userName).Init({
                        HintText: "Account",
                        FontSize: this._inputSize,
                        Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Person)).Init({Size: this._inputSize})
                    }), new PixUI.Input(this._password).Init({
                        IsObscure: true,
                        HintText: "Password",
                        FontSize: this._inputSize,
                        Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Lock)).Init({Size: this._inputSize})
                    }), new PixUI.Button(PixUI.State.op_Implicit_From("Login")).Init({OnTap: e => this.OnLogin()}
                    )]
                }
            )
        });
    }

    private async OnLogin(): System.Task {
        try {
            await AppBoxClient.Channel.Login(this._userName.Value, this._password.Value);
            this.CurrentNavigator!.PushNamed("IDE");
        } catch (ex: any) {
            console.log(ex.Message);
        }
    }

    public Init(props: Partial<LoginPage>): LoginPage {
        Object.assign(this, props);
        return this;
    }
}
