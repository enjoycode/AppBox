import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class TextBase extends PixUI.Widget {
    protected constructor(text: PixUI.State<string>) {
        super();
        this.Text = this.Bind(text, this instanceof PixUI.EditableText ? PixUI.BindingOptions.AffectsVisual : PixUI.BindingOptions.AffectsLayout);
    }

    #Text: PixUI.State<string>;
    public get Text() {
        return this.#Text;
    }

    private set Text(value) {
        this.#Text = value;
    }

    private _fontSize: Nullable<PixUI.State<number>>;
    private _fontWeight: Nullable<PixUI.State<PixUI.FontWeight>>;
    private _textColor: Nullable<PixUI.State<PixUI.Color>>;
    private _maxLines: number = 1;

    private _cachedParagraph: Nullable<PixUI.Paragraph>;

    protected get CachedParagraph(): Nullable<PixUI.Paragraph> {
        return this._cachedParagraph;
    }

    protected get ForceHeight(): boolean {
        return false;
    }

    public get FontSize(): Nullable<PixUI.State<number>> {
        return this._fontSize;
    }

    public set FontSize(value: Nullable<PixUI.State<number>>) {
        this._fontSize = this.Rebind(this._fontSize, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get FontWeight(): Nullable<PixUI.State<PixUI.FontWeight>> {
        return this._fontWeight;
    }

    public set FontWeight(value: Nullable<PixUI.State<PixUI.FontWeight>>) {
        this._fontWeight = this.Rebind(this._fontWeight, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get TextColor(): Nullable<PixUI.State<PixUI.Color>> {
        return this._textColor;
    }

    public set TextColor(value: Nullable<PixUI.State<PixUI.Color>>) {
        this._textColor = this.Rebind(this._textColor, value, PixUI.BindingOptions.AffectsVisual);
    }

    public set MaxLines(value: number) {
        if (value <= 0)
            throw new System.ArgumentException();
        if (this._maxLines != value) {
            this._maxLines = value;
            if (this.IsMounted) {
                this._cachedParagraph?.delete();
                this._cachedParagraph = null;
                this.Invalidate(PixUI.InvalidAction.Relayout);
            }
        }
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

        let color = this._textColor?.Value ?? PixUI.Colors.Black;
        this._cachedParagraph = this.BuildParagraphInternal(text, width, color);
    }

    protected BuildParagraphInternal(text: string, width: number, color: PixUI.Color): PixUI.Paragraph {
        let fontSize = this._fontSize?.Value ?? PixUI.Theme.DefaultFontSize;
        let fontStyle: Nullable<PixUI.FontStyle> = this._fontWeight == null
            ? null
            : new PixUI.FontStyle(this._fontWeight.Value, CanvasKit.FontSlant.Upright);
        return PixUI.TextPainter.BuildParagraph(text, width, fontSize, color, fontStyle, this._maxLines, this.ForceHeight);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);
        
        if (this.Text.Value == null || this.Text.Value.length == 0) {
            this.SetSize(0,0);
            return;
        }

        this.BuildParagraph(this.Text.Value, width);

        //TODO:wait skia fix bug
        //https://groups.google.com/g/skia-discuss/c/WXUVWrcgiko?pli=1
        //https://bugs.chromium.org/p/skia/issues/list?q=Area=%22TextLayout%22

        //W = Math.Min(width, _cachedParagraph.LongestLine);
        this.SetSize(Math.min(width, this._cachedParagraph!.getMaxIntrinsicWidth()), Math.min(height, this._cachedParagraph.getHeight()));
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        if (this.Text.Value == null || this.Text.Value.length == 0) return;

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
