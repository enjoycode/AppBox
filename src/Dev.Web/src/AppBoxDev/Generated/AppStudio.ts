import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDev from '@/AppBoxDev'

export class AppStudio extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Column
        ().Init({
            Children: [new AppBoxDev.MainMenuPad(), new PixUI.Expanded
            ().Init({
                Child: new PixUI.Row
                ().Init({Children: [new AppBoxDev.SidePad()]}
                )
            }), new AppBoxDev.FooterPad()]
        });
    }

    public Init(props: Partial<AppStudio>): AppStudio {
        Object.assign(this, props);
        return this;
    }
}
