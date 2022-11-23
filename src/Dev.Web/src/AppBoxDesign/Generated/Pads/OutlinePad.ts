import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class OutlinePad extends PixUI.View {
    public constructor() {
        super();
        AppBoxDesign.DesignStore.DesignerController.TabSelectChanged.Add(this.OnActiveDesignerChanged, this);

        this.Child = this.NotSupported;
    }

    private readonly NotSupported: PixUI.Widget = new PixUI.Center().Init({Child: new PixUI.Text(PixUI.State.op_Implicit_From("Not supported."))});

    protected OnMounted() {
        this.BuildOutlineView();
    }

    private OnActiveDesignerChanged(index: number) {
        if (!this.IsMounted) return;

        this.BuildOutlineView();
    }

    private BuildOutlineView() {
        let designer = AppBoxDesign.DesignStore.ActiveDesigner;
        if (AppBoxDesign.IsInterfaceOfIModelDesigner(designer)) {
            const modelDesigner = designer;
            let outlinePad = modelDesigner.GetOutlinePad();
            if (outlinePad != null) {
                this.Child = outlinePad;
                this.Invalidate(PixUI.InvalidAction.Relayout);
                return;
            }
        }

        //no outline view
        if (!(this.Child === this.NotSupported)) {
            this.Child = this.NotSupported;
            this.Invalidate(PixUI.InvalidAction.Relayout);
        }
    }
}