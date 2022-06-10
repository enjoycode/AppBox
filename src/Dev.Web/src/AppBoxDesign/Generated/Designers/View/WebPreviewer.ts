import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class WebPreviewer extends PixUI.View {
    public constructor(controller: AppBoxDesign.PreviewController) {
        super();
    }

    public Init(props: Partial<WebPreviewer>): WebPreviewer {
        Object.assign(this, props);
        return this;
    }
}

// #endif