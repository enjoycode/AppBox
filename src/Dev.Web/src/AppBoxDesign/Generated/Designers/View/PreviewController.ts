import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'

export class PreviewController {
    public readonly ModelNode: AppBoxDesign.ModelNode;
    private _invalidateAction: System.Action | null;

    public constructor(modelNode: AppBoxDesign.ModelNode) {
        this.ModelNode = modelNode;
    }
    
    public set InvalidateAction(action: System.Action) {
        this._invalidateAction = action;
    }
    
    public Invalidate(): void {
        this._invalidateAction();
    }
}