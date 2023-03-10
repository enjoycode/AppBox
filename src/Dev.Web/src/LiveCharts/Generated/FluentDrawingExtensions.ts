import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class DrawingFluentExtensions {
    public static Draw(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>): DrawingCanvas {
        return new DrawingCanvas(canvas);
    }

    // /// <summary>
    // /// Initializes a drawing in the canvas of the given chart.
    // /// </summary>
    // /// <param name="chart">The chart.</param>
    // public static Drawing Draw(this IChartView chart)
    // {
    //     return Draw(((LiveChartsCore.Chart<SkiaSharpDrawingContext>)chart.CoreChart).Canvas);
    // }
}

export class DrawingCanvas {
    private _selectedPaint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public constructor(canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>) {
        this.Canvas = canvas;
    }

    #Canvas: LiveChartsCore.MotionCanvas<LiveCharts.SkiaDrawingContext>;
    public get Canvas() {
        return this.#Canvas;
    }

    private set Canvas(value) {
        this.#Canvas = value;
    }

    public SelectPaint(paint: LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>): DrawingCanvas {
        this._selectedPaint = paint;
        this.Canvas.AddDrawableTask(this._selectedPaint);

        return this;
    }

    public SelectColor(color: PixUI.Color, strokeWidth: Nullable<number> = null, isFill: Nullable<boolean> = null): DrawingCanvas {
        strokeWidth ??= 1;
        isFill ??= false;
        let paint = LiveCharts.SolidColorPaint.MakeByColorAndStroke(color, strokeWidth);
        paint.IsFill = isFill;

        return this.SelectPaint(paint);
    }

    public SetClip(clipRectangle: Nullable<LiveChartsCore.LvcRectangle>): DrawingCanvas {
        if (clipRectangle == null) return this;
        if (this._selectedPaint == null)
            throw new System.Exception("There is no paint selected, please select a paint (By calling a Select method) to add the geometry to.");

        this._selectedPaint.SetClipRectangle(this.Canvas, (clipRectangle).Clone());
        return this;
    }

    public Draw(drawable: LiveChartsCore.IDrawable<LiveCharts.SkiaDrawingContext>): DrawingCanvas {
        if (this._selectedPaint == null)
            throw new System.Exception("There is no paint selected, please select a paint (By calling a Select method) to add the geometry to.");

        this._selectedPaint.AddGeometryToPaintTask(this.Canvas, drawable);

        return this;
    }
}