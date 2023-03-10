import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class GeometryVisual<TGeometry extends LiveChartsCore.ISizedGeometry<LiveCharts.SkiaDrawingContext>> extends LiveCharts.BaseGeometryVisual {
    public constructor(geometryFactory: System.Func1<TGeometry>) {
        super();
        this._geometryFactory = geometryFactory;
    }

    public _geometry: Nullable<TGeometry>;
    private _actualSize: LiveChartsCore.LvcSize = (new LiveChartsCore.LvcSize()).Clone();
    private _targetLocation: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint()).Clone();
    private readonly _geometryFactory: System.Func1<TGeometry>;

    public readonly GeometryIntialized = new System.Event<TGeometry>();

    Measure(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize {
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

    OnInvalidated(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>) {
        let x = <number><unknown>this.X;
        let y = <number><unknown>this.Y;

        if (this.LocationUnit == LiveChartsCore.MeasureUnit.ChartValues) {
            if (primaryScaler == null || secondaryScaler == null)
                throw new System.Exception(`You can not use ${LiveChartsCore.MeasureUnit.ChartValues} scale at this element.`);

            x = secondaryScaler.ToPixels(x);
            y = primaryScaler.ToPixels(y);
        }

        this._targetLocation = (new LiveChartsCore.LvcPoint(<number><unknown>this.X + this._xc, <number><unknown>this.Y + this._yc)).Clone();
        this.Measure(chart, primaryScaler, secondaryScaler);

        if (this._geometry == null) {
            let cp = this.GetPositionRelativeToParent();

            this._geometry = this._geometryFactory();
            this._geometry.X = cp.X;
            this._geometry.Y = cp.Y;
            this._geometry.Width = this._actualSize.Width;
            this._geometry.Height = this._actualSize.Height;
            // {
            //     X = cp.X,
            //     Y = cp.Y,
            //     Width = _actualSize.Width,
            //     Height = _actualSize.Height
            // };
            this.GeometryIntialized.Invoke(this._geometry);
            LiveChartsCore.Extensions.TransitionateProperties(this._geometry
                ,)
                .WithAnimationFromChart(chart)
                .CompleteCurrentTransitions();
        }

        this._geometry.X = x + this._xc;
        this._geometry.Y = y + this._yc;
        this._geometry.Width = this._actualSize.Width;
        this._geometry.Height = this._actualSize.Height;

        let drawing = LiveCharts.DrawingFluentExtensions.Draw(chart.Canvas,);
        if (this.Fill != null) drawing.SelectPaint(this.Fill).Draw(this._geometry);
        if (this.Stroke != null) drawing.SelectPaint(this.Stroke).Draw(this._geometry);
    }

    GetTargetLocation(): LiveChartsCore.LvcPoint {
        return this._targetLocation;
    }
}
