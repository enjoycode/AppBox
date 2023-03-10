import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class LineGeometry extends LiveCharts.Geometry implements LiveChartsCore.ILineGeometry<LiveCharts.SkiaDrawingContext> {
    private readonly _x1: LiveChartsCore.FloatMotionProperty;
    private readonly _y1: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._x1 = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("X1", 0));
        this._y1 = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Y1", 0));
    }

    public get X1(): number {
        return this._x1.GetMovement(this);
    }

    public set X1(value: number) {
        this._x1.SetMovement(value, this);
    }

    public get Y1(): number {
        return this._y1.GetMovement(this);
    }

    public set Y1(value: number) {
        this._y1.SetMovement(value, this);
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        context.Canvas.drawLine(this.X, this.Y, this.X1, this.Y1, paint);
    }

    OnMeasure(drawable: LiveCharts.Paint): LiveChartsCore.LvcSize {
        return new LiveChartsCore.LvcSize(Math.abs(this.X1 - this.X), Math.abs(this.Y1 - this.Y));
    }
}
