import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'
import * as LiveCharts from '@/LiveCharts'

export class VariableGeometryVisual extends LiveCharts.BaseGeometryVisual {
    private _geometry: LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>;
    private _isInitialized: boolean = false;
    private _actualSize: LiveChartsCore.LvcSize = (new LiveChartsCore.LvcSize()).Clone();
    private _targetPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint()).Clone();

    public constructor(geometry: LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>) {
        super();
        this._geometry = geometry;
    }

    public get Geometry(): LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext> {
        return this._geometry;
    }

    public set Geometry(value: LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>) {
        if (this._geometry == value) return;
        this._geometry = value;
        this._isInitialized = false;
        this.OnPropertyChanged();
    }

    public readonly GeometryIntialized = new System.Event<LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>>();

    Measure(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>,
            secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize {
        let w = <number><unknown>this.Width;
        let h = <number><unknown>this.Height;

        if (this.SizeUnit == LiveChartsCore.MeasureUnit.ChartValues) {
            if (primaryScaler == null || secondaryScaler == null)
                throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);

            w = secondaryScaler.MeasureInPixels(w);
            h = primaryScaler.MeasureInPixels(h);
        }

        return this._actualSize = new LiveChartsCore.LvcSize(w, h);
    }

    GetTargetSize(): LiveChartsCore.LvcSize {
        return this._actualSize;
    }

    OnInvalidated(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>,
                  secondaryScaler: Nullable<LiveChartsCore.Scaler>) {
        let x = <number><unknown>this.X;
        let y = <number><unknown>this.Y;

        if (this.LocationUnit == LiveChartsCore.MeasureUnit.ChartValues) {
            if (primaryScaler == null || secondaryScaler == null)
                throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);

            x = secondaryScaler.ToPixels(x);
            y = primaryScaler.ToPixels(y);
        }

        this._targetPosition = (new LiveChartsCore.LvcPoint(<number><unknown>this.X + this._xc, <number><unknown>this.Y + this._yc)).Clone();
        this.Measure(chart, primaryScaler, secondaryScaler);

        if (!this._isInitialized) {
            let cp = this.GetPositionRelativeToParent();

            this.Geometry.X = cp.X;
            this.Geometry.Y = cp.Y;
            this.Geometry.Width = this._actualSize.Width;
            this.Geometry.Height = this._actualSize.Height;

            this.GeometryIntialized.Invoke(this.Geometry);
            LiveChartsCore.Extensions.TransitionateProperties(this.Geometry
                ,)
                .WithAnimationFromChart(chart)
                .CompleteCurrentTransitions();

            this._isInitialized = true;
        }

        this.Geometry.X = x + this._xc;
        this.Geometry.Y = y + this._yc;
        this.Geometry.Width = this._actualSize.Width;
        this.Geometry.Height = this._actualSize.Height;

        let drawing = LiveCharts.DrawingFluentExtensions.Draw(chart.Canvas,);
        if (this.Fill != null) drawing.SelectPaint(this.Fill).Draw(this.Geometry);
        if (this.Stroke != null) drawing.SelectPaint(this.Stroke).Draw(this.Geometry);
    }

    GetTargetLocation(): LiveChartsCore.LvcPoint {
        return this._targetPosition;
    }
}