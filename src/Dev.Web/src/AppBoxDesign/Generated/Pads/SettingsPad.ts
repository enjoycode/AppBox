import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class SettingsPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Text(PixUI.State.op_Implicit_From("Settings"));
    }

    public Init(props: Partial<SettingsPad>): SettingsPad {
        Object.assign(this, props);
        return this;
    }
}
