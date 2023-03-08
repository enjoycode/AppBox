import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class StrokeAndFillCartesianSeries<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.CartesianSeries<TModel, TVisual, TLabel, TDrawingContext> {
    private _stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;

    protected constructor(properties: LiveChartsCore.SeriesProperties) {
        super(properties);
    }

    public get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._stroke;
    }

    public set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._stroke, $v => this._stroke = $v), value, true);
    }

    public get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._fill;
    }

    public set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._fill, $v => this._fill = $v), value);
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._stroke, this._fill, this.hoverPaint, this.DataLabelsPaint];
    }

    public MiniatureEquals(series: LiveChartsCore.IChartSeries<TDrawingContext>): boolean {
        if (series instanceof StrokeAndFillCartesianSeries<TModel, TVisual, TLabel, TDrawingContext>) {
            const sfSeries = series;
            return this.Name == series.Name && !(<LiveChartsCore.ISeries><unknown>this).PaintsChanged && this.Fill == sfSeries.Fill && this.Stroke == sfSeries.Stroke;
        }
        return false;
    }
}
