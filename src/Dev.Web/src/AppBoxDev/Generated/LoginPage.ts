import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class LoginPage extends PixUI.View {
    private readonly _userName: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _password: PixUI.State<string> = PixUI.State.op_Implicit_From("");

    public constructor() {
        super();
        this.Child = new PixUI.Center
        ().Init({
            Child: new PixUI.Card().Init({
                    Width: PixUI.State.op_Implicit_From(400),
                    Height: PixUI.State.op_Implicit_From(500),
                    Child: this.BuildLoginForm()
                }
            )
        });
    }

    private BuildLoginForm(): PixUI.Widget {
        return new PixUI.Column
        (PixUI.HorizontalAlignment.Center, 20).Init({
            Children: [new PixUI.Text(PixUI.State.op_Implicit_From("Welcome"))
                .Init({FontSize: PixUI.State.op_Implicit_From(50)}), new PixUI.Input(this._userName).Init({
                HintText: "Account",
                Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Person))
            }), new PixUI.Input(this._password).Init({
                IsObscure: true,
                HintText: "Password",
                Prefix: new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Lock))
            }), new PixUI.Button(PixUI.State.op_Implicit_From("Login"))]
        });
    }

    public Init(props: Partial<LoginPage>): LoginPage {
        Object.assign(this, props);
        return this;
    }
}
