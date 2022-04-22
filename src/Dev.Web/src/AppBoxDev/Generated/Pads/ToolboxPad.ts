import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class ToolboxPad extends PixUI.View {

    public constructor() {
        super();
        this.Child = new PixUI.Text(PixUI.State.op_Implicit_From("Toolbox"));
    }

    public Init(props: Partial<ToolboxPad>): ToolboxPad {
        Object.assign(this, props);
        return this;
    }

}
