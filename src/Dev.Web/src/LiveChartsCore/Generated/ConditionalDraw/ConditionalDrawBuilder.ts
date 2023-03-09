import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class ConditionalPaintBuilder<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> {
    private _isPaintInCanvas: boolean = false;
    private _clipFor: any = {};
    private readonly _series: LiveChartsCore.Series<TModel, TVisual, TLabel, TDrawingContext>;
    private readonly _paint: LiveChartsCore.IPaint<TDrawingContext>;
    private _whenPredicate: Nullable<System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, boolean>>;

    public constructor(series: LiveChartsCore.Series<TModel, TVisual, TLabel, TDrawingContext>, paint: LiveChartsCore.IPaint<TDrawingContext>) {
        this._series = series;
        this._paint = paint;
    }

    public When(predicate: System.Func2<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>, boolean>): LiveChartsCore.Series<TModel, TVisual, TLabel, TDrawingContext> {
        this._whenPredicate = predicate;
        this._series.PointMeasured.Add(this.OnMeasured, this);
        return this._series;
    }

    public Unsubscribe() {
        this._series.PointMeasured.Remove(this.OnMeasured, this);
    }

    private OnMeasured(point: LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>) {
        if (this._whenPredicate == null || point.Visual == null) return;

        let isTriggered = this._whenPredicate.call(this, point);
        let canvas = (<LiveChartsCore.Chart<TDrawingContext>><unknown>point.Context.Chart.CoreChart).Canvas;
        let drawable = <Nullable<LiveChartsCore.IDrawable<TDrawingContext>>><unknown>point.Visual.MainGeometry; // see note #20221909
        if (drawable == null) return;

        if (!this._isPaintInCanvas) {
            canvas.AddDrawableTask(this._paint);
            this._isPaintInCanvas = true;
        }

        if (point.Context.Chart.CoreChart.MeasureWork != this._clipFor) {
            this._clipFor = point.Context.Chart.CoreChart.MeasureWork;
            if (point.Context.Chart.CoreChart instanceof LiveChartsCore.CartesianChart<TDrawingContext>) {
                const cartesianChart = point.Context.Chart.CoreChart;
                let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
                let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
                this._paint.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            }
        }

        if (isTriggered) {
            this._paint.AddGeometryToPaintTask(canvas, drawable);

            for (const paint of this._series.GetPaintTasks()) {
                if (paint == null) continue;
                paint.RemoveGeometryFromPainTask(canvas, drawable);
            }
        } else {
            this._paint.RemoveGeometryFromPainTask(canvas, drawable);
        }
    }
}
