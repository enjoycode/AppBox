import * as PixUI from '@/PixUI'
import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class DoughnutGeometry extends LiveCharts.Geometry implements LiveChartsCore.IDoughnutGeometry<LiveCharts.SkiaDrawingContext>, LiveChartsCore.IDoughnutVisualChartPoint<LiveCharts.SkiaDrawingContext> {
    private readonly _cxProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _cyProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _wProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _hProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _startProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _sweepProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _pushoutProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _innerRadiusProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _cornerRadiusProperty: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._cxProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CenterX"));
        this._cyProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CenterY"));
        this._wProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width"));
        this._hProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Height"));
        this._startProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("StartAngle"));
        this._sweepProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("SweepAngle"));
        this._pushoutProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("PushOut"));
        this._innerRadiusProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("InnerRadius"));
        this._cornerRadiusProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("CornerRadius"));
    }

    public get CenterX(): number {
        return this._cxProperty.GetMovement(this);
    }

    public set CenterX(value: number) {
        this._cxProperty.SetMovement(value, this);
    }

    public get CenterY(): number {
        return this._cyProperty.GetMovement(this);
    }

    public set CenterY(value: number) {
        this._cyProperty.SetMovement(value, this);
    }

    public get Width(): number {
        return this._wProperty.GetMovement(this);
    }

    public set Width(value: number) {
        this._wProperty.SetMovement(value, this);
    }

    public get Height(): number {
        return this._hProperty.GetMovement(this);
    }

    public set Height(value: number) {
        this._hProperty.SetMovement(value, this);
    }

    public get StartAngle(): number {
        return this._startProperty.GetMovement(this);
    }

    public set StartAngle(value: number) {
        this._startProperty.SetMovement(value, this);
    }

    public get SweepAngle(): number {
        return this._sweepProperty.GetMovement(this);
    }

    public set SweepAngle(value: number) {
        this._sweepProperty.SetMovement(value, this);
    }

    public get PushOut(): number {
        return this._pushoutProperty.GetMovement(this);
    }

    public set PushOut(value: number) {
        this._pushoutProperty.SetMovement(value, this);
    }

    public get InnerRadius(): number {
        return this._innerRadiusProperty.GetMovement(this);
    }

    public set InnerRadius(value: number) {
        this._innerRadiusProperty.SetMovement(value, this);
    }

    public get CornerRadius(): number {
        return this._cornerRadiusProperty.GetMovement(this);
    }

    public set CornerRadius(value: number) {
        this._cornerRadiusProperty.SetMovement(value, this);
    }

    public InvertedCornerRadius: boolean = false;

    public static AlternativeDraw: Nullable<System.Action3<DoughnutGeometry, LiveCharts.SkiaDrawingContext, PixUI.Paint>>;

    OnMeasure(paint: LiveCharts.Paint): LiveChartsCore.LvcSize {
        return new LiveChartsCore.LvcSize(this.Width, this.Height);
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        if (DoughnutGeometry.AlternativeDraw != null) {
            DoughnutGeometry.AlternativeDraw(this, context, paint);
            return;
        }

        if (this.CornerRadius > 0) throw new System.NotImplementedException(`${"CornerRadius"} is not implemented.`);

        let path = new CanvasKit.Path();
        let cx = this.CenterX;
        let cy = this.CenterY;
        let wedge = this.InnerRadius;
        let r = this.Width * 0.5;
        let startAngle = this.StartAngle;
        let sweepAngle = this.SweepAngle;
        let toRadians: number = <number><unknown>(Math.PI / 180);
        let pushout = this.PushOut;

        path.moveTo(
            <number><unknown>(cx + Math.cos(startAngle * toRadians) * wedge),
            <number><unknown>(cy + Math.sin(startAngle * toRadians) * wedge));
        path.lineTo(
            <number><unknown>(cx + Math.cos(startAngle * toRadians) * r),
            <number><unknown>(cy + Math.sin(startAngle * toRadians) * r));
        path.arcToOval(
            PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height),
            startAngle,
            sweepAngle,
            false);
        path.lineTo(
            <number><unknown>(cx + Math.cos((sweepAngle + startAngle) * toRadians) * wedge),
            <number><unknown>(cy + Math.sin((sweepAngle + startAngle) * toRadians) * wedge));
        path.arcToRotated(wedge, wedge, 0,
            sweepAngle > 180 ? false : true,
            true,
            <number><unknown>(cx + Math.cos(startAngle * toRadians) * wedge),
            <number><unknown>(cy + Math.sin(startAngle * toRadians) * wedge)
        );

        path.close();

        if (pushout > 0) {
            let pushoutAngle = startAngle + 0.5 * sweepAngle;
            let x = pushout * <number><unknown>Math.cos(pushoutAngle * toRadians);
            let y = pushout * <number><unknown>Math.sin(pushoutAngle * toRadians);

            context.Canvas.save();
            context.Canvas.translate(x, y);
        }

        context.Canvas.drawPath(path, context.Paint);

        if (pushout > 0) context.Canvas.restore();
        path.delete();
    }
}
