import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class Blur extends LiveCharts.ImageFilter {
    private readonly _sigmaX: number;
    private readonly _sigmaY: number;
    private readonly _filter: Nullable<PixUI.ImageFilter> = null;

    // private readonly SKImageFilter.CropRect? _cropRect = null;

    public constructor(sigmaX: number, sigmaY: number, input: Nullable<PixUI.ImageFilter> = null) {
        super();
        this._sigmaX = sigmaX;
        this._sigmaY = sigmaY;
        this._filter = input;
        //_cropRect = cropRect;
    }

    Clone(): LiveCharts.ImageFilter {
        return new Blur(this._sigmaX, this._sigmaY, this._filter);
    }

    CreateFilter(drawingContext: LiveCharts.SkiaDrawingContext) {
        this.SKImageFilter = CanvasKit.ImageFilter.MakeBlur(this._sigmaX, this._sigmaY, CanvasKit.TileMode.Decal, this._filter);
    }
}
