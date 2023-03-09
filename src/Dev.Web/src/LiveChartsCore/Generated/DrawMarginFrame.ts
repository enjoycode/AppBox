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

export abstract class DrawMarginFrame2<TSizedGeometry extends LiveChartsCore.ISizedGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends DrawMarginFrame<TDrawingContext> {
    protected constructor(sizedGeometryFactory: System.Func1<TSizedGeometry>) {
        super();
        this._sizedGeometryFactory = sizedGeometryFactory;
    }

    private _sizedGeometryFactory: System.Func1<TSizedGeometry>;
    private _fillSizedGeometry: Nullable<TSizedGeometry>;
    private _strokeSizedGeometry: Nullable<TSizedGeometry>;
    private _isInitialized: boolean = false;

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let drawLocation = (chart.DrawMarginLocation).Clone();
        let drawMarginSize = (chart.DrawMarginSize).Clone();

        if (this.Fill != null) {
            this.Fill.ZIndex = -3;

            this._fillSizedGeometry ??= this._sizedGeometryFactory();

            this._fillSizedGeometry.X = drawLocation.X;
            this._fillSizedGeometry.Y = drawLocation.Y;
            this._fillSizedGeometry.Width = drawMarginSize.Width;
            this._fillSizedGeometry.Height = drawMarginSize.Height;

            this.Fill.AddGeometryToPaintTask(chart.Canvas, this._fillSizedGeometry);
            chart.Canvas.AddDrawableTask(this.Fill);
        }

        if (this.Stroke != null) {
            this.Stroke.ZIndex = -2;

            this._strokeSizedGeometry ??= this._sizedGeometryFactory();

            this._strokeSizedGeometry.X = drawLocation.X;
            this._strokeSizedGeometry.Y = drawLocation.Y;
            this._strokeSizedGeometry.Width = drawMarginSize.Width;
            this._strokeSizedGeometry.Height = drawMarginSize.Height;

            this.Stroke.AddGeometryToPaintTask(chart.Canvas, this._strokeSizedGeometry);
            chart.Canvas.AddDrawableTask(this.Stroke);
        }

        if (!this._isInitialized) {
            if (this._fillSizedGeometry != null) {
                LiveChartsCore.Extensions.TransitionateProperties(
                    this._fillSizedGeometry
                    , "_fillSizedGeometry.X", "_fillSizedGeometry.Y",
                    "_fillSizedGeometry.Width", "_fillSizedGeometry.Height")
                    .WithAnimationBuilder(animation =>
                        animation
                            .WithDuration(chart.AnimationsSpeed)
                            .WithEasingFunction(chart.EasingFunction))
                    .CompleteCurrentTransitions();
            }
            if (this._strokeSizedGeometry != null) {
                LiveChartsCore.Extensions.TransitionateProperties(
                    this._strokeSizedGeometry
                    , "_fillSizedGeometry.X", "_fillSizedGeometry.Y",
                    "_fillSizedGeometry.Width", "_fillSizedGeometry.Height")
                    .WithAnimationBuilder(animation =>
                        animation
                            .WithDuration(chart.AnimationsSpeed)
                            .WithEasingFunction(chart.EasingFunction))
                    .CompleteCurrentTransitions();
            }

            this._isInitialized = true;
        }
    }
}
