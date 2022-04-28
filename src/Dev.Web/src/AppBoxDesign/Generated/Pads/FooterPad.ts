import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class FooterPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Container
        ().Init({
            Height: PixUI.State.op_Implicit_From(25),
            Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFCC653A)),
            Child: new PixUI.Center
            ().Init({
                    Child: new PixUI.Text(PixUI.State.op_Implicit_From("enjoycode@icloud.com")).Init({Color: PixUI.State.op_Implicit_From(PixUI.Colors.White)}
                    )
                }
            )
        });
    }

    public Init(props: Partial<FooterPad>): FooterPad {
        Object.assign(this, props);
        return this;
    }
}
