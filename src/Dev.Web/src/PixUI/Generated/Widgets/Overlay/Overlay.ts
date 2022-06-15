import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Overlay extends PixUI.Widget implements PixUI.IRootWidget {
    private static readonly $meta_PixUI_IRootWidget = true;

    public constructor(window: PixUI.UIWindow) {
        super();
        this.Window = window;
        this.IsMounted = true;
    }

    #Window: PixUI.UIWindow;
    public get Window() {
        return this.#Window;
    }

    private set Window(value) {
        this.#Window = value;
    }

    private readonly _entries: System.List<PixUI.OverlayEntry> = new System.List<PixUI.OverlayEntry>();

    public get HasEntry(): boolean {
        return this._entries.length > 0;
    }

    public FindEntry(predicate: System.Predicate<PixUI.OverlayEntry>): Nullable<PixUI.OverlayEntry> {
        for (const entry of this._entries) {
            if (predicate(entry)) return entry;
        }

        return null;
    }


    public Show(entry: PixUI.OverlayEntry) {
        if (this._entries.Contains(entry)) return;

        this._entries.Add(entry);
        entry.Owner = this;
        entry.Widget.Parent = this;
        entry.Widget.Layout(this.Window.Width, this.Window.Height);

        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public ShowBelow(entry: PixUI.OverlayEntry, below: PixUI.OverlayEntry) {
        throw new System.NotImplementedException();
    }

    public ShowAbove(entry: PixUI.OverlayEntry, above: PixUI.OverlayEntry) {
        throw new System.NotImplementedException();
    }

    public Remove(entry: PixUI.OverlayEntry) {
        if (!this._entries.Remove(entry)) return;

        entry.Widget.Parent = null;

        this.Invalidate(PixUI.InvalidAction.Repaint);
    }


    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        for (const entry of this._entries) {
            if (this.HitTestChild(entry.Widget, x, y, result))
                break;
        }

        return result.IsHitAnyMouseRegion;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        for (const entry of this._entries) {
            entry.Widget.Layout(availableWidth, availableHeight);
        }
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        for (const entry of this._entries) {
            // if (entry.Widget.W <= 0 || entry.Widget.H <= 0)
            //     continue;

            let needTranslate = entry.Widget.X != 0 || entry.Widget.Y != 0;
            if (needTranslate)
                canvas.translate(entry.Widget.X, entry.Widget.Y);
            entry.Widget.Paint(canvas, area);
            if (needTranslate)
                canvas.translate(-entry.Widget.X, -entry.Widget.Y);
        }
    }

    public Init(props: Partial<Overlay>): Overlay {
        Object.assign(this, props);
        return this;
    }

}
