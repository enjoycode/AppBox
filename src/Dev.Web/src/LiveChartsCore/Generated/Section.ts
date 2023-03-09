import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Section<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartElement<TDrawingContext> implements System.INotifyPropertyChanged {
    private static readonly $meta_System_INotifyPropertyChanged = true;
    private _stroke: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _fill: Nullable<LiveChartsCore.IPaint<TDrawingContext>> = null;
    private _xi: Nullable<number>;
    private _xj: Nullable<number>;
    private _yi: Nullable<number>;
    private _yj: Nullable<number>;
    private _scalesXAt: number = 0;
    private _scalesYAt: number = 0;
    private _zIndex: Nullable<number>;
    private _isVisible: boolean = true;

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

    public get IsVisible(): boolean {
        return this._isVisible;
    }

    public set IsVisible(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isVisible, $v => this._isVisible = $v), value);
    }

    public get Xi(): Nullable<number> {
        return this._xi;
    }

    public set Xi(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._xi, $v => this._xi = $v), value);
    }

    public get Xj(): Nullable<number> {
        return this._xj;
    }

    public set Xj(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._xj, $v => this._xj = $v), value);
    }

    public get Yi(): Nullable<number> {
        return this._yi;
    }

    public set Yi(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._yi, $v => this._yi = $v), value);
    }

    public get Yj(): Nullable<number> {
        return this._yj;
    }

    public set Yj(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._yj, $v => this._yj = $v), value);
    }

    public get ScalesXAt(): number {
        return this._scalesXAt;
    }

    public set ScalesXAt(value: number) {
        this.SetProperty(new System.Ref(() => this._scalesXAt, $v => this._scalesXAt = $v), value);
    }

    public get ScalesYAt(): number {
        return this._scalesYAt;
    }

    public set ScalesYAt(value: number) {
        this.SetProperty(new System.Ref(() => this._scalesYAt, $v => this._scalesYAt = $v), value);
    }

    public get ZIndex(): Nullable<number> {
        return this._zIndex;
    }

    public set ZIndex(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._zIndex, $v => this._zIndex = $v), value);
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._stroke, this._fill];
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }
}

export abstract class Section2<TSizedGeometry extends LiveChartsCore.ISizedGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends Section<TDrawingContext> {

    protected readonly _sizedGeometryFactory: System.Func1<TSizedGeometry>;

    protected constructor(sizedGeometryFactory: System.Func1<TSizedGeometry>) {
        super();
        this._sizedGeometryFactory = sizedGeometryFactory;
    }

    public _fillSizedGeometry: Nullable<TSizedGeometry>;

    public _strokeSizedGeometry: Nullable<TSizedGeometry>;

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let drawLocation = (chart.DrawMarginLocation).Clone();
        let drawMarginSize = (chart.DrawMarginSize).Clone();

        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;
        let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
        let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];

        let secondaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), secondaryAxis);
        let primaryScale = LiveChartsCore.Scaler.Make((drawLocation).Clone(), (drawMarginSize).Clone(), primaryAxis);

        let xi = this.Xi == null ? drawLocation.X : secondaryScale.ToPixels(this.Xi);
        let xj = this.Xj == null ? drawLocation.X + drawMarginSize.Width : secondaryScale.ToPixels(this.Xj);

        let yi = this.Yi == null ? drawLocation.Y : primaryScale.ToPixels(this.Yi);
        let yj = this.Yj == null ? drawLocation.Y + drawMarginSize.Height : primaryScale.ToPixels(this.Yj);

        if (this.Fill != null) {
            this.Fill.ZIndex = this.ZIndex ?? -2.5;

            if (this._fillSizedGeometry == null) {
                // _fillSizedGeometry = new TSizedGeometry
                // {
                //     X = xi,
                //     Y = yi,
                //     Width = xj - xi,
                //     Height = yj - yi
                // };
                this._fillSizedGeometry = this._sizedGeometryFactory();
                this._fillSizedGeometry.X = xi;
                this._fillSizedGeometry.Y = yi;
                this._fillSizedGeometry.Width = xj - xi;
                this._fillSizedGeometry.Height = yj - yi;
                LiveChartsCore.Extensions.TransitionateProperties(
                    this._fillSizedGeometry
                    , "_fillSizedGeometry.X",
                    "_fillSizedGeometry.Width",
                    "_fillSizedGeometry.Y",
                    "_fillSizedGeometry.Height")
                    .WithAnimationBuilder(animation =>
                        animation
                            .WithDuration(chart.AnimationsSpeed)
                            .WithEasingFunction(chart.EasingFunction));

                this._fillSizedGeometry.CompleteTransition(null);
            }

            this._fillSizedGeometry.X = xi;
            this._fillSizedGeometry.Y = yi;
            this._fillSizedGeometry.Width = xj - xi;
            this._fillSizedGeometry.Height = yj - yi;

            this.Fill.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            this.Fill.AddGeometryToPaintTask(chart.Canvas, this._fillSizedGeometry);
            chart.Canvas.AddDrawableTask(this.Fill);
        }

        if (this.Stroke != null) {
            this.Stroke.ZIndex = this.ZIndex ?? 0;

            if (this._strokeSizedGeometry == null) {
                // _strokeSizedGeometry = new TSizedGeometry
                // {
                //     X = xi,
                //     Y = yi,
                //     Width = xj - xi,
                //     Height = yj - yi
                // };
                this._strokeSizedGeometry = this._sizedGeometryFactory();
                this._strokeSizedGeometry.X = xi;
                this._strokeSizedGeometry.Y = yi;
                this._strokeSizedGeometry.Width = xj - xi;
                this._strokeSizedGeometry.Height = yj - yi;
                LiveChartsCore.Extensions.TransitionateProperties(
                    this._strokeSizedGeometry
                    , "_strokeSizedGeometry.X",
                    "_strokeSizedGeometry.Width",
                    "_strokeSizedGeometry.Y",
                    "_strokeSizedGeometry.Height")
                    .WithAnimationBuilder(animation =>
                        animation
                            .WithDuration(chart.AnimationsSpeed)
                            .WithEasingFunction(chart.EasingFunction));

                this._strokeSizedGeometry.CompleteTransition(null);
            }

            this._strokeSizedGeometry.X = xi;
            this._strokeSizedGeometry.Y = yi;
            this._strokeSizedGeometry.Width = xj - xi;
            this._strokeSizedGeometry.Height = yj - yi;

            this.Stroke.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            this.Stroke.AddGeometryToPaintTask(chart.Canvas, this._strokeSizedGeometry);
            chart.Canvas.AddDrawableTask(this.Stroke);
        }
    }
}
