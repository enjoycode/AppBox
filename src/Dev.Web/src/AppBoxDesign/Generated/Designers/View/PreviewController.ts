import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'

export class PreviewController {
    public readonly ModelNode: AppBoxDesign.ModelNode;
    private _invalidateAction: Nullable<System.Action>;

    public constructor(modelNode: AppBoxDesign.ModelNode) {
        this.ModelNode = modelNode;
    }

    public set InvalidateAction(value: System.Action) {
        this._invalidateAction = value;
    }

    public Invalidate() {
        this._invalidateAction?.call(this);
    }
}
