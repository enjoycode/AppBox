import * as PixUI from '@/PixUI'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class RoundedRectangleGeometry extends LiveCharts.SizedGeometry implements LiveChartsCore.IRoundedRectangleChartPoint<LiveCharts.SkiaDrawingContext> {
    private static readonly $meta_LiveChartsCore_IRoundedRectangleChartPoint = true;
    private readonly _rx: LiveChartsCore.FloatMotionProperty;
    private readonly _ry: LiveChartsCore.FloatMotionProperty;

    public constructor() {
        super();
        this._rx = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Rx", 8));
        this._ry = this.RegisterMotionProperty(new LiveChartsCore.FloatMotionProperty("Ry", 8));
    }

    public get Rx(): number {
        return this._rx.GetMovement(this);
    }

    public set Rx(value: number) {
        this._rx.SetMovement(value, this);
    }

    public get Ry(): number {
        return this._ry.GetMovement(this);
    }

    public set Ry(value: number) {
        this._ry.SetMovement(value, this);
    }

    OnDraw(context: LiveCharts.SkiaDrawingContext, paint: PixUI.Paint) {
        // context.Canvas.DrawRoundRect(
        //     new SKRect { Top = Y, Left = X, Size = new SKSize { Height = Height, Width = Width } }, Rx, Ry, paint);
        let rrect = PixUI.RRect.FromRectAndRadius(PixUI.Rect.FromLTWH(this.X, this.Y, this.Width, this.Height), this.Rx, this.Ry);
        context.Canvas.drawRRect(rrect, paint);
    }
}
