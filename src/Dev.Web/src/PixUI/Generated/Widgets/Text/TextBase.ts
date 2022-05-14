import * as PixUI from '@/PixUI'

export abstract class TextBase extends PixUI.Widget {
    #Text: PixUI.State<string>;
    public get Text() {
        return this.#Text;
    }

    private set Text(value) {
        this.#Text = value;
    }

    private _fontSize: Nullable<PixUI.State<number>>;
    private _color: Nullable<PixUI.State<PixUI.Color>>;

    private _cachedParagraph: Nullable<PixUI.Paragraph>;

    protected get CachedParagraph(): Nullable<PixUI.Paragraph> {
        return this._cachedParagraph;
    }

    public get FontSize(): Nullable<PixUI.State<number>> {
        return this._fontSize;
    }

    public set FontSize(value: Nullable<PixUI.State<number>>) {
        this._fontSize = this.Rebind(this._fontSize, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get Color(): Nullable<PixUI.State<PixUI.Color>> {
        return this._color;
    }

    public set Color(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._color = this.Rebind(this._color, value, PixUI.BindingOptions.AffectsVisual);
    }

    protected constructor(text: PixUI.State<string>) {
        super();
        this.Text = this.Bind(text, this instanceof PixUI.EditableText ? PixUI.BindingOptions.AffectsVisual : PixUI.BindingOptions.AffectsLayout);
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        //TODO: fast update font size or color use skia paragraph
        this._cachedParagraph?.delete();
        this._cachedParagraph = null;
        super.OnStateChanged(state, options);
    }

    protected BuildParagraph(text: string, width: number) {
        //if (_cachedParagraph != null) return;
        this._cachedParagraph?.delete();

        let color = this._color?.Value ?? PixUI.Colors.Black;
        this._cachedParagraph = this.BuildParagraphInternal(text, width, color);
    }

    protected BuildParagraphInternal(text: string, width: number, color: PixUI.Color): PixUI.Paragraph {
        let fontSize = this._fontSize?.Value ?? PixUI.Theme.DefaultFontSize;
        let ts = PixUI.MakeTextStyle({color: color, fontSize: fontSize});
        let ps = PixUI.MakeParagraphStyle({maxLines: 1, textStyle: ts});
        if (this instanceof PixUI.EditableText) {
            ts.heightMultiplier = 1;
            ps.heightMultiplier = 1;
        }

        let pb = PixUI.MakeParagraphBuilder(ps);

        pb.pushStyle(ts);
        pb.addText(text);
        pb.pop();
        let ph = pb.build();
        ph.layout(width);
        pb.delete();
        return ph;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        this.BuildParagraph(this.Text.Value, width);

        //TODO:wait skia fix bug
        //https://groups.google.com/g/skia-discuss/c/WXUVWrcgiko?pli=1
        //https://bugs.chromium.org/p/skia/issues/list?q=Area=%22TextLayout%22

        //W = Math.Min(width, _cachedParagraph.LongestLine);
        this.SetSize(Math.min(width, this._cachedParagraph!.getMaxIntrinsicWidth()), Math.min(height, this._cachedParagraph.getHeight()));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.Text.Value.length == 0) return;

        if (this._cachedParagraph == null) //可能颜色改变后导致的缓存丢失，可以简单重建
        {
            let width = this.Width == null
                ? this.CachedAvailableWidth
                : Math.min(Math.max(0, this.Width.Value), this.CachedAvailableWidth);
            this.BuildParagraph(this.Text.Value, width);
        }

        canvas.drawParagraph(this._cachedParagraph!, 0, 0);
        //Console.WriteLine($"Paint Text Widget: {_value} at {Left},{Top},{Width},{Height}");
    }
}
