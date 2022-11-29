import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class FocusedDecoration {
    public constructor(widget: PixUI.Widget, focusedBorderBuilder: System.Func1<PixUI.ShapeBorder>,
                       unfocusedBorderBuilder: Nullable<System.Func1<Nullable<PixUI.ShapeBorder>>> = null) {
        this.Widget = widget;
        this._focusedBorderBuilder = focusedBorderBuilder;
        this._unfocusedBorderBuilder = unfocusedBorderBuilder;
    }

    public readonly Widget: PixUI.Widget;

    // Focus时的Border,用于动画结束
    private readonly _focusedBorderBuilder: System.Func1<PixUI.ShapeBorder>;

    // 未Focus时的Border,用于动画开始
    private readonly _unfocusedBorderBuilder: Nullable<System.Func1<Nullable<PixUI.ShapeBorder>>>;

    private _decorator: Nullable<FocusedDecorator>;

    public AttachFocusChangedEvent(widget: PixUI.Widget) {
        if (PixUI.IsInterfaceOfIFocusable(widget)) {
            const focusable = widget;
            focusable.FocusNode.FocusChanged.Add(this._OnFocusChanged, this);
        }
    }

    private _OnFocusChanged(focused: boolean) {
        if (focused) {
            this._decorator = new FocusedDecorator(this);
            this.Widget.Overlay?.Show(this._decorator);
        } else {
            this._decorator?.Hide();
        }
    }

    public GetUnfocusedBorder(): Nullable<PixUI.ShapeBorder> {
        return this._unfocusedBorderBuilder?.call(this);
    }

    public GetFocusedBorder(): PixUI.ShapeBorder {
        return this._focusedBorderBuilder();
    }

    public StopAndReset() {
        this._decorator?.Reset();
    } //will remove overlay

    public RemoveOverlayEntry() {
        if (this._decorator == null) return;
        (<PixUI.Overlay><unknown>this._decorator.Parent!).Remove(this._decorator);
        this._decorator = null;
    }
}

export class FocusedDecorator extends PixUI.Widget {
    private readonly _owner: FocusedDecoration;
    private readonly _from: Nullable<PixUI.ShapeBorder>;
    private readonly _to: PixUI.ShapeBorder;
    private readonly _tween: Nullable<PixUI.ShapeBorder>;
    private _controller: Nullable<PixUI.AnimationController>;

    public constructor(owner: FocusedDecoration) {
        super();
        this._owner = owner;
        this._from = owner.GetUnfocusedBorder();
        this._to = owner.GetFocusedBorder();
        if (this._from != null)
            this._tween = this._from.Clone();
    }

    public Hide() {
        if (this._from == null) {
            this._owner.RemoveOverlayEntry();
            return;
        }

        this._controller?.Reverse();
    }

    public Reset() {
        this._controller?.Reset();
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        return false; // Can't hit
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //do nothing
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let widget = this._owner.Widget;
        let pt2Win = widget.LocalToWindow(0, 0);
        let bounds = PixUI.Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);

        if (this._from == null) {
            this._to.Paint(canvas, bounds);
            return;
        }

        this._tween!.Paint(canvas, bounds);
    }

    protected OnMounted() {
        if (this._from == null) return;

        if (this._controller == null) {
            this._controller = new PixUI.AnimationController(200);
            this._controller.ValueChanged.Add(this.OnAnimationValueChanged, this);
            this._controller.StatusChanged.Add(this.OnAnimationStateChanged, this);
        }

        this._controller.Forward();
    }

    private OnAnimationValueChanged() {
        this._from!.LerpTo(this._to, this._tween!, this._controller!.Value);
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private OnAnimationStateChanged(status: PixUI.AnimationStatus) {
        if (status == PixUI.AnimationStatus.Dismissed) {
            this._owner.RemoveOverlayEntry();
        }
    }

    public Dispose() {
        if (this._controller != null) {
            this._controller.ValueChanged.Remove(this.OnAnimationValueChanged, this);
            this._controller.StatusChanged.Remove(this.OnAnimationStateChanged, this);
            this._controller.Dispose();
        }

        super.Dispose();
    }
}
