import * as PixUI from '@/PixUI'

export class SettingsPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Text(PixUI.State.op_Implicit_From("Settings"));
    }
}
