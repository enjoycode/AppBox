import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class AppStudio extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Column
        ().Init({
            Children: [new AppBoxDesign.MainMenuPad(), new PixUI.Expanded
            ().Init({
                Child: new PixUI.Row
                ().Init({Children: [new AppBoxDesign.SidePad(), new PixUI.Expanded()]}
                )
            }), new AppBoxDesign.FooterPad()]
        });
    }

    public Init(props: Partial<AppStudio>): AppStudio {
        Object.assign(this, props);
        return this;
    }
}
