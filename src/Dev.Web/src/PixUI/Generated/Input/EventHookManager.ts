import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class EventHookManager {
    private readonly _hookRefs: System.List<WeakRef<any>> = new System.List<WeakRef<any>>();

    public HookEvent(type: PixUI.EventType, e: Nullable<any>): boolean {
        if (this._hookRefs.length == 0) return false;

        let r = PixUI.EventPreviewResult.NotProcessed;
        for (let i = 0; i < this._hookRefs.length; i++) {
            let hook = this._hookRefs[i].deref() as PixUI.IEventHook;

            if (hook == null) {
                this._hookRefs.RemoveAt(i);
                i--;
            } else {
                let single = hook.PreviewEvent(type, e);
                if ((single & PixUI.EventPreviewResult.Processed) == PixUI.EventPreviewResult.Processed)
                    r |= PixUI.EventPreviewResult.Processed;
                if ((single & PixUI.EventPreviewResult.NoDispatch) == PixUI.EventPreviewResult.NoDispatch)
                    r |= PixUI.EventPreviewResult.NoDispatch;
                if ((single & PixUI.EventPreviewResult.NoContinue) == PixUI.EventPreviewResult.NoContinue) {
                    r |= PixUI.EventPreviewResult.NoContinue;
                    break;
                }
            }
        }

        return (r & PixUI.EventPreviewResult.NoDispatch) == PixUI.EventPreviewResult.NoDispatch;
    }

    public Add(hook: PixUI.IEventHook) {
        this._hookRefs.Add(new WeakRef<any>(hook));
    }

    public Remove(hook: PixUI.IEventHook) {
        for (let i = 0; i < this._hookRefs.length; i++) {
            let weakRef = this._hookRefs[i];
            if ((weakRef.deref() === hook)) {
                this._hookRefs.RemoveAt(i);
                break;
            }
        }
    }
}
