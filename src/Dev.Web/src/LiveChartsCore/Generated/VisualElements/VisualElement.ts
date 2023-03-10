import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class VisualElement<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartElement<TDrawingContext> implements System.INotifyPropertyChanged {
    private static readonly $meta_System_INotifyPropertyChanged = true;
    public _x: number = 0;
    public _y: number = 0;
    public _xc: number = 0;
    public _yc: number = 0;
    public _parent: Nullable<LiveChartsCore.ISizedGeometry<TDrawingContext>>;
    private _scalesXAt: number = 0;
    private _scalesYAt: number = 0;

    public get X(): number {
        return this._x;
    }

    public set X(value: number) {
        this._x = value;
        this.OnPropertyChanged();
    }

    public get Y(): number {
        return this._y;
    }

    public set Y(value: number) {
        this._y = value;
        this.OnPropertyChanged();
    }

    public LocationUnit: LiveChartsCore.MeasureUnit = LiveChartsCore.MeasureUnit.Pixels;

    public get ScalesXAt(): number {
        return this._scalesXAt;
    }

    public set ScalesXAt(value: number) {
        this._scalesXAt = value;
        this.OnPropertyChanged();
    }

    public get ScalesYAt(): number {
        return this._scalesYAt;
    }

    public set ScalesYAt(value: number) {
        this._scalesYAt = value;
        this.OnPropertyChanged();
    }

    public readonly PropertyChanged = new System.Event<any, System.PropertyChangedEventArgs>();

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let primary: Nullable<LiveChartsCore.Scaler> = null;
        let secondary: Nullable<LiveChartsCore.Scaler> = null;

        let cartesianChart: Nullable<LiveChartsCore.CartesianChart<TDrawingContext>> = null;

        if (chart instanceof LiveChartsCore.CartesianChart<TDrawingContext>) {
            const cc = chart;
            cartesianChart = cc;
            let primaryAxis = cartesianChart.YAxes[this.ScalesYAt];
            let secondaryAxis = cartesianChart.XAxes[this.ScalesXAt];
            secondary = LiveChartsCore.Extensions.GetNextScaler(secondaryAxis, cartesianChart);
            primary = LiveChartsCore.Extensions.GetNextScaler(primaryAxis, cartesianChart);
        }

        // Todo: polar and pie
        // if (chart is PolarChart<TDrawingContext> pc)
        // if (chart is PieChart<TDrawingContext> pc)
        // if (chart is PolarChart<TDrawingContext> pc)
        // {
        //     var primaryAxis = pc.AngleAxes[ScalesYAt];
        //     var secondaryAxis = pc.RadiusAxes[ScalesXAt];

        //     var primary = new PolarScaler(
        //         chart.DrawMarginLocation, chart.DrawMarginSize, primaryAxis, secondaryAxis, pc.InnerRadius, pc.InitialRotation, pc.TotalAnge);
        // }

        for (const paintTask of this.GetPaintTasks()) {
            if (paintTask == null) continue;

            if (cartesianChart != null) {
                //paintTask.SetClipRectangle(
                //    cartesianChart.Canvas,
                //    new LvcRectangle(cartesianChart.DrawMarginLocation, cartesianChart.DrawMarginSize));
            }

            chart.Canvas.AddDrawableTask(paintTask);
        }

        this.OnInvalidated(chart, primary, secondary);
    }

    public abstract Measure(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize ;

    public abstract GetTargetLocation(): LiveChartsCore.LvcPoint ;

    public abstract GetTargetSize(): LiveChartsCore.LvcSize ;

    OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }

    protected OnPropertyChanged(propertyName: Nullable<string> = null) {
        this.PropertyChanged.Invoke(this, new System.PropertyChangedEventArgs(propertyName));
    }

    public abstract OnInvalidated(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): void;

    protected GetPositionRelativeToParent(): LiveChartsCore.LvcPoint {
        let parentX = 0;
        let parentY = 0;

        if (this._parent != null) {
            let xProperty = <LiveChartsCore.FloatMotionProperty><unknown>this._parent.MotionProperties.GetAt("_parent.X");
            let yProperty = <LiveChartsCore.FloatMotionProperty><unknown>this._parent.MotionProperties.GetAt("_parent.Y");
            parentX = xProperty.GetCurrentValue(<LiveChartsCore.Animatable><unknown>this._parent);
            parentY = yProperty.GetCurrentValue(<LiveChartsCore.Animatable><unknown>this._parent);
        }

        return new LiveChartsCore.LvcPoint(<number><unknown>(parentX + this.X), <number><unknown>(parentY + this.Y));
    }

    public IsHitBy(chart: LiveChartsCore.IChart, point: LiveChartsCore.LvcPoint): System.IEnumerable<VisualElement<TDrawingContext>> {
        const _$generator = function* (this: any, chart: LiveChartsCore.IChart, point: LiveChartsCore.LvcPoint) {
            let motionCanvas = <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>chart.Canvas;
            if (motionCanvas.StartPoint != null) {
                point.X -= motionCanvas.StartPoint.X;
                point.Y -= motionCanvas.StartPoint.Y;
            }

            let location = this.GetTargetLocation();
            let size = this.GetTargetSize();

            // it returns an enumerable because there are more complex types where a visual can contain more than one element
            if (point.X >= location.X && point.X <= location.X + size.Width &&
                point.Y >= location.Y && point.Y <= location.Y + size.Height)
                yield this;
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(chart, point));
    }

    public AlignToTopLeftCorner() {
        // just a workaround to align labels as the rest of the geometries.
    }
}
