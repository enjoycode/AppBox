import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SkiaDrawingContext extends LiveChartsCore.DrawingContext {
    private readonly _clearOnBegingDraw: boolean;

    public constructor(
        motionCanvas: LiveChartsCore.MotionCanvas<SkiaDrawingContext>,
        width: number, height: number,
        canvas: PixUI.Canvas,
        clearOnBegingDraw: boolean = true) {
        super();
        this.MotionCanvas = motionCanvas;
        this.Width = width;
        this.Height = height;
        this.Canvas = canvas;
        this.PaintTask = null!;
        this.Paint = null!;
        this._clearOnBegingDraw = clearOnBegingDraw;
    }

    public MotionCanvas: LiveChartsCore.MotionCanvas<SkiaDrawingContext>;

    public Width: number = 0;

    public Height: number = 0;

    // /// <summary>
    // /// Gets or sets the surface.
    // /// </summary>
    // /// <value>
    // /// The surface.
    // /// </value>
    // public SKSurface Surface { get; set; }

    public Canvas: PixUI.Canvas;

    public PaintTask: LiveCharts.Paint;

    public Paint: PixUI.Paint;

    public Background: PixUI.Color = PixUI.Color.Empty;

    OnBegingDraw() {
        //if (_clearOnBegingDraw) Canvas.Clear();
        if (System.OpInequality(this.Background, PixUI.Color.Empty)) {
            this.Canvas.drawRect(PixUI.Rect.FromLTWH(0, 0, this.Width, this.Height), PixUI.PaintUtils.Shared(this.Background));
        }

        if (this.MotionCanvas.StartPoint == null ||
            (this.MotionCanvas.StartPoint.X == 0 &&
                this.MotionCanvas.StartPoint.Y == 0)) return;

        this.Canvas.translate(this.MotionCanvas.StartPoint.X, this.MotionCanvas.StartPoint.Y);
    }

    OnEndDraw() {
        //if (MotionCanvas.StartPoint == null) return;
        //Canvas.Restore();
    }
}
