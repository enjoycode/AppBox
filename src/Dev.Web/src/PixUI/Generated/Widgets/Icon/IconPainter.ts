import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class IconPainter implements System.IDisposable {
    public constructor(onFontLoaded: System.Action) {
        this._onFontLoaded = onFontLoaded;
    }

    private readonly _onFontLoaded: System.Action;
    private _cachedFont: Nullable<PixUI.Font>;
    private _cachedGlyphId: number = 0;
    private _loading: boolean = false;

    public Paint(canvas: PixUI.Canvas, size: number, color: PixUI.Color, data: PixUI.IconData,
                 offsetX: number = 0, offsetY: number = 0) {
        if (this._cachedFont == null) {
            let typeface = PixUI.FontCollection.Instance.TryMatchFamilyFromAsset(data.FontFamily);
            if (typeface == null && !this._loading) {
                this._loading = true;
                PixUI.FontCollection.Instance.StartLoadFontFromAsset(data.AssemblyName,
                    data.AssetPath, data.FontFamily);
                PixUI.FontCollection.Instance.FontChanged.Add(this._OnFontChanged, this);
                return;
            }

            this._cachedFont = new CanvasKit.Font(typeface!, size);
            this._cachedGlyphId = this._cachedFont.getGlyphIDs(String.fromCharCode(data.CodePoint))[0];
        }

        let paint = PixUI.PaintUtils.Shared(color);
        canvas.drawGlyphs([this._cachedGlyphId], [offsetX, size + offsetY], 0, 0, this._cachedFont!, paint);
    }

    private _OnFontChanged() {
        PixUI.FontCollection.Instance.FontChanged.Remove(this._OnFontChanged, this);
        this._onFontLoaded();
    }

    public Reset() {
        this._cachedFont?.delete();
        this._cachedFont = null;
        this._cachedGlyphId = 0;
        this._loading = false;
    }

    public Dispose() {
        this._cachedFont?.delete();
    }
}
