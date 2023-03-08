import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class DrawMarginFrame<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartElement<TDrawingContext> {
    private _stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;

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
        return [this._stroke, this._fill];
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }
}

