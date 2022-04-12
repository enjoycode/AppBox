import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Caret {
    private readonly _widget: PixUI.Widget;
    public readonly ColorBuilder: System.Func<PixUI.Color>;
    public readonly BoundsBuilder: System.Func<PixUI.Rect>;

    private _overlayEntry: Nullable<PixUI.OverlayEntry>;

    public constructor(widget: PixUI.Widget, colorBuilder: System.Func<PixUI.Color>, boundsBuilder: System.Func<PixUI.Rect>) {
        this._widget = widget;
        this.ColorBuilder = colorBuilder;
        this.BoundsBuilder = boundsBuilder;
    }

    public Show() {
        this._overlayEntry ??= new PixUI.OverlayEntry(new CaretDecorator(this));
        this._widget.Overlay?.Show(this._overlayEntry);
    }

    public Hide() {
        this._overlayEntry?.Remove();
    }

    public NotifyPositionChanged() {
        this._overlayEntry?.Invalidate();
    }

    public Init(props: Partial<Caret>): Caret {
        Object.assign(this, props);
        return this;
    }
}

export class CaretDecorator extends PixUI.Widget {
    private readonly _owner: Caret;

    public constructor(owner: Caret) {
        super();
        this._owner = owner;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //do nothing
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let paint = PixUI.PaintUtils.Shared(this._owner.ColorBuilder(), CanvasKit.PaintStyle.Fill);
        let bounds = this._owner.BoundsBuilder();
        canvas.drawRect(PixUI.Rect.FromLTWH(bounds.Left, bounds.Top, bounds.Width, bounds.Height), paint);
    }

    protected OnMounted() {
        //TODO: start animation
    }

    protected OnUnmounted() {
        //TODO: stop animation
    }

    public Init(props: Partial<CaretDecorator>): CaretDecorator {
        Object.assign(this, props);
        return this;
    }
}
