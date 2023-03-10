import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class HoverDecoration {
    public constructor(widget: PixUI.Widget, shapeBuilder: System.Func1<PixUI.ShapeBorder>,
                       boundsGetter: Nullable<System.Func1<PixUI.Rect>> = null, elevation: number = 4,
                       hoverColor: Nullable<PixUI.Color> = null) {
        this.Widget = widget;
        this.ShapeBuilder = shapeBuilder;
        this.BoundsGetter = boundsGetter;
        this.Elevation = elevation;
        this.HoverColor = hoverColor;
    }

    public readonly Widget: PixUI.Widget;
    public readonly ShapeBuilder: System.Func1<PixUI.ShapeBorder>;
    public readonly BoundsGetter: Nullable<System.Func1<PixUI.Rect>>;
    public readonly Elevation: number;
    public readonly HoverColor: Nullable<PixUI.Color>;
    private _decorator: Nullable<HoverDecorator>;

    public Show() {
        this._decorator = new HoverDecorator(this);
        this.Widget.Overlay?.Show(this._decorator);
    }

    public Hide() {
        if (this._decorator == null) return;
        (<PixUI.Overlay><unknown>this._decorator.Parent!).Remove(this._decorator);
        this._decorator = null;
    }

    public AttachHoverChangedEvent(widget: PixUI.IMouseRegion) {
        widget.MouseRegion.HoverChanged.Add(this._OnHoverChanged, this);
    }

    private _OnHoverChanged(hover: boolean) {
        if (hover)
            this.Show();
        else
            this.Hide();
    }
}

export class HoverDecorator extends PixUI.Widget {
    private readonly _owner: HoverDecoration;
    private readonly _shape: PixUI.ShapeBorder;

    public constructor(owner: HoverDecoration) {
        super();
        this._owner = owner;
        this._shape = owner.ShapeBuilder();
    }

    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        return false; //Can't hit
    }

    Layout(availableWidth: number, availableHeight: number) {
        //do nothing
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let bounds: PixUI.Rect = PixUI.Rect.Empty.Clone();
        if (this._owner.BoundsGetter == null) {
            let widget = this._owner.Widget;
            let pt2Win = widget.LocalToWindow(0, 0);
            bounds = PixUI.Rect.FromLTWH(pt2Win.X, pt2Win.Y, widget.W, widget.H);
        } else {
            bounds = this._owner.BoundsGetter();
        }

        let path = this._shape.GetOuterPath(bounds);

        // draw shadow
        if (this._owner.Elevation > 0) {
            canvas.save();
            canvas.clipPath(path, CanvasKit.ClipOp.Difference, false);
            PixUI.DrawShadow(canvas, path, PixUI.Colors.Black, this._owner.Elevation, false, this.Root!.Window.ScaleFactor);
            canvas.restore();
        }

        // draw hover color
        if (this._owner.HoverColor != null) {
            canvas.save();
            canvas.clipPath(path, CanvasKit.ClipOp.Intersect, false);
            let paint = PixUI.PaintUtils.Shared(this._owner.HoverColor);
            // paint.BlendMode = _owner.BlendMode;
            canvas.drawPath(path, paint);
            canvas.restore();
        }
        path.delete();
    }
}
