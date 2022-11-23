import * as PixUI from '@/PixUI'

export class FooterPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Container().Init(
            {
                Height: PixUI.State.op_Implicit_From(25),
                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFCC653A)),
                Child: new PixUI.Center().Init(
                    {
                        Child: new PixUI.Text(PixUI.State.op_Implicit_From("enjoycode@icloud.com")).Init({TextColor: PixUI.State.op_Implicit_From(PixUI.Colors.White)})
                    })
            });
    }
}
