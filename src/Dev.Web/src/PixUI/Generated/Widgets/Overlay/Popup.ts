import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IPopup {
    Close(): void;
}

export abstract class Popup extends PixUI.Widget implements IPopup, PixUI.IEventHook {
    protected readonly _overlay: PixUI.Overlay;
    private readonly _overlayEntry: PixUI.OverlayEntry;

    protected constructor(overlay: PixUI.Overlay) {
        super();
        this._overlay = overlay;
        this._overlayEntry = new PixUI.OverlayEntry(this);
    }

    public Open() {
        this._overlay.Window.EventHookManager.Add(this);
        this._overlay.Show(this._overlayEntry);
    }

    public Close() {
        this._overlay.Window.EventHookManager.Remove(this);
        this._overlay.Remove(this._overlayEntry);
    }

    public PreviewEvent(type: PixUI.EventType, e: Nullable<object>): PixUI.EventPreviewResult {
        return PixUI.EventPreviewResult.NotProcessed;
    }
}
