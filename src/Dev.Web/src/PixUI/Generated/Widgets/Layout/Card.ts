import * as PixUI from '@/PixUI'

export class Card extends PixUI.SingleChildWidget {
    public static readonly DefaultMargin: number = 4;

    private static readonly DefaultShape: PixUI.ShapeBorder = new PixUI.RoundedRectangleBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(4)));

    private _margin: Nullable<PixUI.State<PixUI.EdgeInsets>>;
    private _elevation: Nullable<PixUI.State<number>>;
    private _color: Nullable<PixUI.State<PixUI.Color>>;
    private _shadowColor: Nullable<PixUI.State<PixUI.Color>>;
    private _shape: Nullable<PixUI.State<PixUI.ShapeBorder>>;


    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get ShadowColor(): Nullable<PixUI.State<PixUI.Color>> {
        return this._shadowColor;
    }

    public set ShadowColor(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._shadowColor = this.Rebind(this._shadowColor, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get Elevation(): Nullable<PixUI.State<number>> {
        return this._elevation;
    }

    public set Elevation(value: Nullable<PixUI.State<number>>) {
        this._elevation = this.Rebind(this._elevation, value, PixUI.BindingOptions.AffectsVisual);
    }

    public get Margin(): Nullable<PixUI.State<PixUI.EdgeInsets>> {
        return this._margin;
    }

    public set Margin(value: Nullable<PixUI.State<PixUI.EdgeInsets>>) {
        this._margin = this.Rebind(this._margin, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get Shape(): Nullable<PixUI.State<PixUI.ShapeBorder>> {
        return this._shape;
    }

    public set Shape(value: Nullable<PixUI.State<PixUI.ShapeBorder>>) {
        this._shape = this.Rebind(this._shape, value, PixUI.BindingOptions.AffectsLayout);
    }


    //TODO:方形框无Margin且不透明背景
    //protected internal override bool IsOpaque => _color != null && _color.Value.Alpha == 0;

    Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        if (this.Child == null) {
            this.SetSize(width, height);
            return;
        }

        let margin = this._margin?.Value ?? PixUI.EdgeInsets.All(Card.DefaultMargin);
        let padding = this.Padding?.Value ?? PixUI.EdgeInsets.All(0);

        this.Child.Layout(width - margin.Horizontal - padding.Horizontal,
            height - margin.Vertical - padding.Vertical);
        this.Child.SetPosition(margin.Left + padding.Left, margin.Top + padding.Top);
        this.SetSize(this.Child.W + margin.Horizontal + padding.Horizontal,
            this.Child.H + margin.Vertical + padding.Vertical);
    }

    get Clipper(): Nullable<PixUI.IClipper> {
        let shape = this._shape?.Value ?? Card.DefaultShape;
        let rect = this.GetChildRect();
        let path = shape.GetOuterPath(rect);
        return new PixUI.ClipperOfPath(path);
    }

    private GetChildRect(): PixUI.Rect {
        let margin = this._margin?.Value ?? PixUI.EdgeInsets.All(Card.DefaultMargin);
        return PixUI.Rect.FromLTWH(margin.Left, margin.Top, this.W - margin.Left - margin.Right,
            this.H - margin.Top - margin.Bottom);
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let color = this._color?.Value ?? PixUI.Colors.White;
        let shadowColor = this._shadowColor?.Value ?? PixUI.Colors.Black;
        let elevation = this._elevation?.Value ?? 2;
        let rect = this.GetChildRect();
        let shape = this._shape?.Value ?? Card.DefaultShape;
        let clipper = this.Clipper!;

        //先画阴影
        let outer = clipper.GetPath();
        if (elevation > 0) {
            PixUI.DrawShadow(canvas, outer, shadowColor, elevation, shadowColor.Alpha != 0xFF, this.Root!.Window.ScaleFactor);
        }

        //Clip外形后填充背景及边框
        canvas.save();
        clipper.ApplyToCanvas(canvas);
        canvas.clear(color);
        shape.Paint(canvas, rect);

        this.PaintChildren(canvas, area);

        canvas.restore();
        clipper.Dispose();
    }

}
