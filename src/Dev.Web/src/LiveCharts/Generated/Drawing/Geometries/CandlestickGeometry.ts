import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class CandlestickGeometry extends LiveCharts.Geometry implements LiveChartsCore.IFinancialVisualChartPoint<LiveCharts.SkiaDrawingContext> {
    private readonly _wProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _oProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _cProperty: LiveChartsCore.FloatMotionProperty;
    private readonly _lProperty: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._wProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Width", 0));
        this._oProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Open", 0));
        this._cProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Close", 0));
        this._lProperty = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Low", 0));
    }

    public get Width(): number {
        return this._wProperty.GetMovement(this);
    }

    public set Width(value: number) {
        this._wProperty.SetMovement(value, this);
    }

    public get Open(): number {
        return this._oProperty.GetMovement(this);
    }

    public set Open(value: number) {
        this._oProperty.SetMovement(value, this);
    }

    public get Close(): number {
        return this._cProperty.GetMovement(this);
    }

    public set Close(value: number) {
        this._cProperty.SetMovement(value, this);
    }

    public get Low(): number {
        return this._lProperty.GetMovement(this);
    }

    public set Low(value: number) {
        this._lProperty.SetMovement(value, this);
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        let w = this.Width;
        let cx = this.X + w * 0.5;
        let h = this.Y;
        let o = this.Open;
        let c = this.Close;
        let l = this.Low;

        let yi: number = 0;
        let yj: number = 0;

        if (o > c) {
            yi = c;
            yj = o;
        } else {
            yi = o;
            yj = c;
        }

        context.Canvas.drawLine(cx, h, cx, yi, paint);
        context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, yi, w, Math.abs(o - c)), paint);
        context.Canvas.drawLine(cx, yj, cx, l, paint);
    }

    OnMeasure(paintTaks: LiveCharts.Paint): LiveChartsCore.LvcSize {
        return new LiveChartsCore.LvcSize(this.Width, Math.abs(this.Low - this.Y));
    }
}
