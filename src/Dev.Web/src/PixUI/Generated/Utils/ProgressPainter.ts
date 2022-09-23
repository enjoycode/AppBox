import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class CircularProgressPainter implements System.IDisposable {
    public constructor() {
        this._controller = new PixUI.AnimationController(CircularProgressPainter._kIndeterminateCircularDuration);
    }

    public Dispose() {
        this._controller.Dispose();
    }

    private static readonly _kIndeterminateCircularDuration: number = 1333 * 2222;
    private static readonly _pathCount: number = CircularProgressPainter._kIndeterminateCircularDuration / 1333;
    private static readonly _rotationCount: number = CircularProgressPainter._kIndeterminateCircularDuration / 2222;

    private static readonly _twoPi: number = Math.PI * 2.0;
    private static readonly _epsilon: number = 0.001;
    private static readonly _sweep: number = CircularProgressPainter._twoPi - CircularProgressPainter._epsilon;
    private static readonly _startAngle: number = -Math.PI / 2.0;

    private readonly _controller: PixUI.AnimationController;

    private readonly _strokeHeadTween: PixUI.Animatable<number> = new PixUI.CurveTween(new PixUI.Interval(0.0, 0.5, PixUI.Curves.FastOutSlowIn))
        .Chain(new PixUI.CurveTween(new PixUI.SawTooth(CircularProgressPainter._pathCount)));

    private readonly _strokeTailTween: PixUI.Animatable<number> = new PixUI.CurveTween(new PixUI.Interval(0.5, 1.0, PixUI.Curves.FastOutSlowIn))
        .Chain(new PixUI.CurveTween(new PixUI.SawTooth(CircularProgressPainter._pathCount)));

    private readonly _offsetTween: PixUI.Animatable<number> = new PixUI.CurveTween(new PixUI.SawTooth(CircularProgressPainter._pathCount));

    private readonly _rotationTween: PixUI.Animatable<number> = new PixUI.CurveTween(new PixUI.SawTooth(CircularProgressPainter._rotationCount));

    public Start(valueChangedAction: System.Action) {
        this._controller.ValueChanged.Add(valueChangedAction, this);
        this._controller.Repeat();
    }

    public Stop() {
        this._controller.Stop();
    }

    public PaintToWidget(target: PixUI.Widget, canvas: PixUI.Canvas, indicatorSize: number = 36) {
        let dx = (target.W - indicatorSize) / 2.0;
        let dy = (target.H - indicatorSize) / 2.0;
        canvas.translate(dx, dy);
        this.Paint(canvas, indicatorSize);
        canvas.translate(-dx, -dy);
    }

    public Paint(canvas: PixUI.Canvas, indicatorSize: number) {
        let headValue = this._strokeHeadTween.Evaluate(this._controller);
        let tailValue = this._strokeTailTween.Evaluate(this._controller);
        let offsetValue = this._offsetTween.Evaluate(this._controller);
        let rotationValue = this._rotationTween.Evaluate(this._controller);

        let valueColor = PixUI.Theme.FocusedColor; //default is Theme.Primary
        CircularProgressPainter.PaintInternal(canvas, indicatorSize, null, headValue, tailValue, offsetValue, rotationValue, 6, valueColor);
    }

    private static PaintInternal(canvas: PixUI.Canvas, size: number, value: Nullable<number>, headValue: number, tailValue: number, offsetValue: number, rotationValue: number, strokeWidth: number, valueColor: PixUI.Color, bgColor: Nullable<PixUI.Color> = null) {
        let rect = PixUI.Rect.FromLTWH(0, 0, size, size);
        let arcStart = value != null
            ? CircularProgressPainter._startAngle
            : CircularProgressPainter._startAngle + tailValue * 3.0 / 2.0 * Math.PI + rotationValue * Math.PI * 2.0 +
            offsetValue * 0.5 * Math.PI;
        let arcSweep = value != null
            ? clamp(value, 0.0, 1.0) * CircularProgressPainter._sweep
            : Math.max(headValue * 3.0 / 2.0 * Math.PI - tailValue * 3.0 / 2.0 * Math.PI, CircularProgressPainter._epsilon);

        if (bgColor != null) {
            let bgPaint = PixUI.PaintUtils.Shared(bgColor, CanvasKit.PaintStyle.Stroke, strokeWidth);
            bgPaint.setAntiAlias(true);
            canvas.drawArc(rect, 0 * 180 / Math.PI, <number><unknown>CircularProgressPainter._sweep * 180 / Math.PI, false, bgPaint);
        }

        let paint = PixUI.PaintUtils.Shared(valueColor, CanvasKit.PaintStyle.Stroke, strokeWidth);
        paint.setAntiAlias(true);
        if (value == null) // Indeterminate
            paint.setStrokeCap(CanvasKit.StrokeCap.Square);

        canvas.drawArc(rect, <number><unknown>arcStart * 180 / Math.PI, <number><unknown>arcSweep * 180 / Math.PI, false, paint);
    }

    public Init(props: Partial<CircularProgressPainter>): CircularProgressPainter {
        Object.assign(this, props);
        return this;
    }
}
