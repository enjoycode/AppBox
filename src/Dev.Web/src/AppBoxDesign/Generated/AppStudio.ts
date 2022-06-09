import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class AppStudio extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Column().Init(
            {
                Children: [new AppBoxDesign.MainMenuPad(), new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.Row().Init(
                            {
                                Children: [new AppBoxDesign.SidePad(), new PixUI.Expanded().Init(
                                    {
                                        Child: new PixUI.Column().Init(
                                            {
                                                Children: [new PixUI.Expanded().Init({Child: new AppBoxDesign.DesignerPad()}), new AppBoxDesign.BottomPad()]
                                            })
                                    })
                                ]
                            })
                    }), new AppBoxDesign.FooterPad()
                ]
            });
    }

    public Init(props: Partial<AppStudio>): AppStudio {
        Object.assign(this, props);
        return this;
    }
}
