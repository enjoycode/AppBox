import * as PixUI from '@/PixUI'

export interface IPopup {
    Hide(): void;
}

export abstract class Popup extends PixUI.Widget implements IPopup, PixUI.IEventHook {
    private readonly _overlay: PixUI.Overlay;
    private readonly _overlayEntry: PixUI.OverlayEntry;

    protected constructor(overlay: PixUI.Overlay) {
        super();
        this._overlay = overlay;
        this._overlayEntry = new PixUI.OverlayEntry(this);
    }

    public UpdatePosition(x: number, y: number) {
        this._overlayEntry.UpdatePosition(x, y);
    }

    public Show(relativeTo: Nullable<PixUI.Widget> = null, relativeOffset: Nullable<PixUI.Offset> = null) {
        if (relativeTo != null) {
            //TODO: 暂只实现在下方显示，应该入参确定相对位置
            let winPt = relativeTo.LocalToWindow(0, 0);
            let offsetX = relativeOffset?.Dx ?? 0;
            let offsetY = relativeOffset?.Dy ?? 0;
            this.SetPosition(winPt.X + offsetX, winPt.Y + relativeTo.H + offsetY);
        }

        this._overlay.Window.EventHookManager.Add(this);
        this._overlay.Show(this._overlayEntry);
    }

    public Hide() {
        this._overlay.Window.EventHookManager.Remove(this);
        this._overlay.Remove(this._overlayEntry);
    }

    public PreviewEvent(type: PixUI.EventType, e: Nullable<any>): PixUI.EventPreviewResult {
        return PixUI.EventPreviewResult.NotProcessed;
    }
}
