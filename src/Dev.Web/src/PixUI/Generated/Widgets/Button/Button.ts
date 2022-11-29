import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Button extends PixUI.Widget implements PixUI.IMouseRegion, PixUI.IFocusable {
    private static readonly $meta_PixUI_IMouseRegion = true;
    private static readonly $meta_PixUI_IFocusable = true;

    public constructor(text: Nullable<PixUI.State<string>> = null, icon: Nullable<PixUI.State<PixUI.IconData>> = null) {
        super();
        this._text = text;
        this._icon = icon;

        this.Height = PixUI.State.op_Implicit_From(Button.DefaultHeight); //TODO: 默认字体高+padding

        this.MouseRegion = new PixUI.MouseRegion(() => PixUI.Cursors.Hand);
        this.FocusNode = new PixUI.FocusNode();

        this._hoverDecoration = new PixUI.HoverDecoration(this, this.GetHoverShaper.bind(this), this.GetHoverBounds.bind(this));
        this._hoverDecoration.AttachHoverChangedEvent(this);
    }

    public static readonly DefaultHeight: number = 30;
    public static readonly StandardRadius: number = 4;

    private _text: Nullable<PixUI.State<string>>;
    private _icon: Nullable<PixUI.State<PixUI.IconData>>;
    private _outlineWidth: Nullable<PixUI.State<number>>;
    private _textColor: Nullable<PixUI.State<PixUI.Color>>;
    private _fontSize: Nullable<PixUI.State<number>>;

    public Style: PixUI.ButtonStyle = PixUI.ButtonStyle.Solid;
    public Shape: PixUI.ButtonShape = PixUI.ButtonShape.Standard;

    private _textWidget: Nullable<PixUI.Text>;
    private _iconWidget: Nullable<PixUI.Icon>;

    public get TextColor(): Nullable<PixUI.State<PixUI.Color>> {
        return this._textColor;
    }

    public set TextColor(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._textColor = value;
        if (this._textWidget != null) this._textWidget.TextColor = value;
        if (this._iconWidget != null) this._iconWidget.Color = value;
    }

    public get FontSize(): Nullable<PixUI.State<number>> {
        return this._fontSize;
    }

    public set FontSize(value: Nullable<PixUI.State<number>>) {
        this._fontSize = value;
        if (this._textWidget != null) this._textWidget.FontSize = value;
        if (this._iconWidget != null) this._iconWidget.Size = value;
    }

    private readonly _hoverDecoration: PixUI.HoverDecoration;

    #MouseRegion: PixUI.MouseRegion;
    public get MouseRegion() {
        return this.#MouseRegion;
    }

    private set MouseRegion(value) {
        this.#MouseRegion = value;
    }

    #FocusNode: PixUI.FocusNode;
    public get FocusNode() {
        return this.#FocusNode;
    }

    private set FocusNode(value) {
        this.#FocusNode = value;
    }

    public set OnTap(value: System.Action1<PixUI.PointerEvent>) {
        this.MouseRegion.PointerTap.Add(value, this);
    }

    private GetHoverShaper(): PixUI.ShapeBorder {
        switch (this.Shape) {
            case PixUI.ButtonShape.Square:
                return new PixUI.RoundedRectangleBorder(); //TODO: use RectangleBorder
            case PixUI.ButtonShape.Standard:
                return new PixUI.RoundedRectangleBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(Button.StandardRadius)));
            case PixUI.ButtonShape.Pills:
                return new PixUI.RoundedRectangleBorder(null, PixUI.BorderRadius.All(PixUI.Radius.Circular(this.H / 2)));
            default:
                throw new System.NotImplementedException();
        }
    }

    private GetHoverBounds(): PixUI.Rect {
        //Icon only 特殊处理
        if (this._iconWidget != null && this._textWidget == null && this.Style == PixUI.ButtonStyle.Transparent) {
            let pt2Win = this._iconWidget.LocalToWindow(0, 0);
            return PixUI.Rect.FromLTWH(pt2Win.X, pt2Win.Y, this._iconWidget.W, this._iconWidget.H);
        } else {
            let pt2Win = this.LocalToWindow(0, 0);
            return PixUI.Rect.FromLTWH(pt2Win.X, pt2Win.Y, this.W, this.H);
        }
    }


    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.TryBuildContent();
        this._iconWidget?.Layout(width, height);
        this._textWidget?.Layout(width - (this._iconWidget?.W ?? 0), height);
        let contentWidth = (this._iconWidget?.W ?? 0) + (this._textWidget?.W ?? 0);
        if (this.Width == null)
            this.SetSize(Math.max(Button.DefaultHeight, contentWidth + 16), height);
        else
            this.SetSize(width, height);

        //TODO: 根据icon位置计算
        // var contentHeight = Math.Max(_iconWidget?.H ?? 0, _textWidget?.H ?? 0);
        let contentOffsetX = (this.W - contentWidth) / 2;
        // var contentOffsetY = (H - contentHeight) / 2;
        this._iconWidget?.SetPosition(contentOffsetX, (this.H - this._iconWidget!.H) / 2);
        this._textWidget?.SetPosition(contentOffsetX + (this._iconWidget?.W ?? 0),
            (this.H - this._textWidget!.H) / 2);
    }

    private TryBuildContent() {
        if (this._text == null && this._icon == null) return;

        if (this._textColor == null) {
            this._textColor = PixUI.State.op_Implicit_From(this.Style == PixUI.ButtonStyle.Solid ? PixUI.Colors.White : PixUI.Colors.Black);
        }

        if (this._text != null && this._textWidget == null) {
            this._textWidget = new PixUI.Text(this._text).Init({
                TextColor: this._textColor,
                FontSize: this._fontSize
            });
            this._textWidget.Parent = this;
        }

        if (this._icon != null && this._iconWidget == null) {
            this._iconWidget = new PixUI.Icon(this._icon).Init({Color: this._textColor, Size: this._fontSize});
            this._iconWidget.Parent = this;
        }
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        this.PaintShape(canvas);

        if (this._iconWidget != null) {
            canvas.translate(this._iconWidget.X, this._iconWidget.Y);
            this._iconWidget.Paint(canvas, area);
            canvas.translate(-this._iconWidget.X, -this._iconWidget.Y);
        }

        if (this._textWidget != null) {
            canvas.translate(this._textWidget.X, this._textWidget.Y);
            this._textWidget.Paint(canvas, area);
            canvas.translate(-this._textWidget.X, -this._textWidget.Y);
        }
    }

    private PaintShape(canvas: PixUI.Canvas) {
        if (this.Style == PixUI.ButtonStyle.Transparent) return;

        let paint = PixUI.PaintUtils.Shared();
        paint.setStyle(this.Style == PixUI.ButtonStyle.Solid ? CanvasKit.PaintStyle.Fill : CanvasKit.PaintStyle.Stroke);
        paint.setStrokeWidth(this.Style == PixUI.ButtonStyle.Outline ? (this._outlineWidth?.Value ?? 2) : 0);
        paint.setAntiAlias(this.Shape != PixUI.ButtonShape.Square);
        paint.setColor(new PixUI.Color(0xFF3880FF)); //TODO:

        switch (this.Shape) {
            case PixUI.ButtonShape.Square:
                canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), paint);
                break;
            case PixUI.ButtonShape.Standard: {
                let rrect = PixUI.RRect.FromRectAndRadius(PixUI.Rect.FromLTWH(0, 0, this.W, this.H),
                    Button.StandardRadius, Button.StandardRadius);
                canvas.drawRRect(rrect, paint);
                break;
            }
            default:
                throw new System.NotImplementedException();
        }
    }

    protected OnUnmounted() {
        super.OnUnmounted();
        this._hoverDecoration.Hide();
    }

    public Dispose() {
        this._textWidget?.Dispose();
        this._iconWidget?.Dispose();
        super.Dispose();
    }

}
