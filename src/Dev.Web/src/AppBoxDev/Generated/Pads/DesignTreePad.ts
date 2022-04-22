import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class DesignTreePad extends PixUI.View {

    public constructor() {
        super();
        this.Child = new PixUI.Text(PixUI.State.op_Implicit_From("DesignTree"));
    }

    public Init(props: Partial<DesignTreePad>): DesignTreePad {
        Object.assign(this, props);
        return this;
    }

}
