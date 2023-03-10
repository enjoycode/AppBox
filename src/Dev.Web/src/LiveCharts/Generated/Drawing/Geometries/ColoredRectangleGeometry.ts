import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class ColoredRectangleGeometry extends LiveCharts.SizedGeometry implements LiveChartsCore.ISolidColorChartPoint<LiveCharts.SkiaDrawingContext> {
    private readonly _colorProperty: LiveChartsCore.ColorMotionProperty;

    public constructor() {
        super();
        this._colorProperty = this.RegisterMotionProperty(new LiveChartsCore.ColorMotionProperty("Color"));
    }

    public get Color(): LiveChartsCore.LvcColor {
        return this._colorProperty.GetMovement(this);
    }

    public set Color(value: LiveChartsCore.LvcColor) {
        this._colorProperty.SetMovement((value).Clone(), this);
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        let c = (this.Color).Clone();
        paint.setColor(new PixUI.Color(c.R, c.G, c.B, c.A));

        context.Canvas.drawRect(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), paint);
    }
}
