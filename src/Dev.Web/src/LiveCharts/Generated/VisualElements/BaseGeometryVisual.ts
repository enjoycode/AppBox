import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class BaseGeometryVisual extends LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext> {
    private _width: number = 0;
    private _height: number = 0;
    private _fill: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;
    private _stroke: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;

    public get Width(): number {
        return this._width;
    }

    public set Width(value: number) {
        this._width = value;
        this.OnPropertyChanged("Width");
    }

    public get Height(): number {
        return this._height;
    }

    public set Height(value: number) {
        this._height = value;
        this.OnPropertyChanged("Height");
    }

    public SizeUnit: LiveChartsCore.MeasureUnit = LiveChartsCore.MeasureUnit.Pixels;

    public get Fill(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._fill;
    }

    public set Fill(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._fill, $v => this._fill = $v), value);
    }

    public get Stroke(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._stroke;
    }

    public set Stroke(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._stroke, $v => this._stroke = $v), value, true, "Stroke");
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>[] {
        return [this._fill, this._stroke];
    }

    OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }
}
