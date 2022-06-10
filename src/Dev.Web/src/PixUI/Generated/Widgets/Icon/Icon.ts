import * as PixUI from '@/PixUI'

export class Icon extends PixUI.Widget {
    public constructor(data: PixUI.State<PixUI.IconData>) {
        super();
        this._painter = new PixUI.IconPainter(this.OnIconFontLoaded.bind(this));
        this._data = this.Bind(data, PixUI.BindingOptions.AffectsVisual);
    }

    private readonly _data: PixUI.State<PixUI.IconData>;
    private _size: Nullable<PixUI.State<number>>;
    private _color: Nullable<PixUI.State<PixUI.Color>>;

    private readonly _painter: PixUI.IconPainter;

    public get Size(): Nullable<PixUI.State<number>> {
        return this._size;
    }

    public set Size(value: Nullable<PixUI.State<number>>) {
        this._size = this.Rebind(this._size, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    private OnIconFontLoaded() {
        if (!this.IsMounted) //有时候会作为其他组件的不可访问的子组件
            this.Parent?.Invalidate(PixUI.InvalidAction.Repaint, new PixUI.RepaintArea(PixUI.Rect.FromLTWH(this.X, this.Y, this.W, this.H)));
        else
            this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if ((state === this._data) || (state === this._size)) {
            this._painter.Reset();
        }

        super.OnStateChanged(state, options);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let size = this._size?.Value ?? PixUI.Theme.DefaultFontSize;
        this.SetSize(Math.max(0, Math.min(availableWidth, size)), Math.max(0, Math.min(availableHeight, size)));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        let size = this._size?.Value ?? PixUI.Theme.DefaultFontSize;
        let color = this._color?.Value ?? new PixUI.Color(0xff5f6368);
        this._painter.Paint(canvas, size, color, this._data.Value);
    }

    public Dispose() {
        this._painter.Dispose();
        super.Dispose();
    }

    public Init(props: Partial<Icon>): Icon {
        Object.assign(this, props);
        return this;
    }
}
