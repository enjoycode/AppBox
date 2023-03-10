import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'

export class DropShadow extends LiveCharts.ImageFilter {
    private readonly _dx: number;
    private readonly _dy: number;
    private readonly _sigmaX: number;
    private readonly _sigmaY: number;
    private readonly _color: PixUI.Color;
    private readonly _filter: Nullable<PixUI.ImageFilter> = null;

    // private readonly SKImageFilter.CropRect? _cropRect = null;

    public constructor(dx: number, dy: number, sigmaX: number, sigmaY: number, color: PixUI.Color, input: Nullable<PixUI.ImageFilter> = null) {
        super();
        this._dx = dx;
        this._dy = dy;
        this._sigmaX = sigmaX;
        this._sigmaY = sigmaY;
        this._color = color;
        this._filter = input;
        // _cropRect = cropRect;
    }

    Clone(): LiveCharts.ImageFilter {
        return new DropShadow(this._dx, this._dy, this._sigmaX, this._sigmaY, this._color, this._filter);
    }

    CreateFilter(drawingContext: LiveCharts.SkiaDrawingContext) {
        this.SKImageFilter = CanvasKit.ImageFilter.MakeDropShadow(this._dx, this._dy, this._sigmaX, this._sigmaY, this._color, this._filter);
    }
}
