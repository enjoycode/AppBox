import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Caret {
    public constructor(widget: PixUI.Widget, colorBuilder: System.Func1<PixUI.Color>, boundsBuilder: System.Func1<PixUI.Rect>) {
        this._widget = widget;
        this.ColorBuilder = colorBuilder;
        this.BoundsBuilder = boundsBuilder;
    }

    private readonly _widget: PixUI.Widget; //拥有caret的Widget
    public readonly ColorBuilder: System.Func1<PixUI.Color>;
    public readonly BoundsBuilder: System.Func1<PixUI.Rect>;
    private _decorator: Nullable<CaretDecorator>;

    public Show() {
        this._decorator = new CaretDecorator(this);
        this._widget.Overlay?.Show(this._decorator);
    }

    public Hide() {
        if (this._decorator == null) return;
        (<PixUI.Overlay><unknown>this._decorator.Parent!).Remove(this._decorator);
        this._decorator = null;
    }

    public NotifyPositionChanged() {
        this._decorator?.Invalidate(PixUI.InvalidAction.Repaint);
    }
}

export class CaretDecorator extends PixUI.Widget {
    private readonly _owner: Caret;

    public constructor(owner: Caret) {
        super();
        this._owner = owner;
    }

    Layout(availableWidth: number, availableHeight: number) {
        //do nothing
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let paint = PixUI.PaintUtils.Shared(this._owner.ColorBuilder(), CanvasKit.PaintStyle.Fill);
        let bounds = this._owner.BoundsBuilder();
        canvas.drawRect(PixUI.Rect.FromLTWH(bounds.Left, bounds.Top, bounds.Width, bounds.Height),
            paint);
    }

    OnMounted() {
        //TODO: start animation
    }

    OnUnmounted() {
        //TODO: stop animation
    }
}
