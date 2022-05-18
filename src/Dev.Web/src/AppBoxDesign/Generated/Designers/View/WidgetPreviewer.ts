import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class WidgetPreviewer extends PixUI.View {
    private _scale: PixUI.Matrix4 = PixUI.Matrix4.CreateIdentity();

    public constructor(controller: AppBoxDesign.PreviewController) {
        super();

        this.Child = new PixUI.Container().Init({
            Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFA2A2A2)),
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
            Child: new PixUI.Card().Init({
                    Elevation: PixUI.State.op_Implicit_From(10),
                    Child: new PixUI.Transform((this._scale).Clone())
                        .Init({Child: new AppBoxDesign.WebPreviewer(controller)})
                }
            )
        });
    }

    public Init(props: Partial<WidgetPreviewer>): WidgetPreviewer {
        Object.assign(this, props);
        return this;
    }
}
