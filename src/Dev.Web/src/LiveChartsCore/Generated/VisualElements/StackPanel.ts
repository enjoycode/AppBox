import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class StackPanel<TBackgroundGemetry extends LiveChartsCore.ISizedGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.VisualElement<TDrawingContext> {
    public constructor(backgroundGeometryFactory: System.Func1<TBackgroundGemetry>) {
        super();
        this._backgroundGeometryFactory = backgroundGeometryFactory;
    }

    private readonly _backgroundGeometryFactory: System.Func1<TBackgroundGemetry>;
    private _targetPosition: LiveChartsCore.LvcPoint = LiveChartsCore.LvcPoint.Empty.Clone();
    private _backgroundPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _backgroundGeometry: Nullable<TBackgroundGemetry>;

    public get Children(): System.HashSet<LiveChartsCore.VisualElement<TDrawingContext>> {
        return new System.HashSet();
    }

    public Orientation: LiveChartsCore.ContainerOrientation = 0;

    public VerticalAlignment: LiveChartsCore.Align = LiveChartsCore.Align.Middle;

    public HorizontalAlignment: LiveChartsCore.Align = LiveChartsCore.Align.Middle;

    public Padding: LiveChartsCore.Padding = new LiveChartsCore.Padding(0, 0, 0, 0);

    public get BackgroundPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._backgroundPaint;
    }

    public set BackgroundPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._backgroundPaint, $v => this._backgroundPaint = $v), value);
    }

    public GetTargetLocation(): LiveChartsCore.LvcPoint {
        return this._targetPosition;
    }

    public GetTargetSize(): LiveChartsCore.LvcSize {
        let size = (this.Orientation == LiveChartsCore.ContainerOrientation.Horizontal
            ? this.Children.Aggregate(new LiveChartsCore.LvcSize(0, 0), (current, next) => {
                let size = next.GetTargetSize();

                return new LiveChartsCore.LvcSize(current.Width + size.Width,
                    size.Height > current.Height ? size.Height : current.Height);
            })
            : this.Children.Aggregate(new LiveChartsCore.LvcSize(0, 0), (current, next) => {
                let size = next.GetTargetSize();

                return new LiveChartsCore.LvcSize(size.Width > current.Width ? size.Width : current.Width,
                    current.Height + size.Height);
            })).Clone();

        return new LiveChartsCore.LvcSize(this.Padding.Left + this.Padding.Right + size.Width, this.Padding.Top + this.Padding.Bottom + size.Height);
    }

    public Measure(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize {
        for (const child of this.Children) child.Measure(chart, primaryScaler, secondaryScaler);
        return this.GetTargetSize();
    }

    public RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        for (const child of this.Children) {
            child.RemoveFromUI(chart);
        }

        super.RemoveFromUI(chart);
    }

    public OnInvalidated(chart: LiveChartsCore.Chart<TDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>) {
        let xl = this.Padding.Left;
        let yl = this.Padding.Top;

        this._targetPosition = (new LiveChartsCore.LvcPoint(<number><unknown>this.X + this._xc, <number><unknown>this.Y + this._yc)).Clone();
        let controlSize = this.Measure(chart, primaryScaler, secondaryScaler);

        if (this._backgroundGeometry == null) {
            let cp = this.GetPositionRelativeToParent();

            // _backgroundGeometry = new TBackgroundGemetry
            // {
            //     X = cp.X,
            //     Y = cp.Y,
            //     Width = controlSize.Width,
            //     Height = controlSize.Height
            // };
            this._backgroundGeometry = this._backgroundGeometryFactory();
            this._backgroundGeometry.X = cp.X;
            this._backgroundGeometry.Y = cp.Y;
            this._backgroundGeometry.Width = controlSize.Width;
            this._backgroundGeometry.Height = controlSize.Height;
            LiveChartsCore.Extensions.TransitionateProperties(
                this._backgroundGeometry
                ,)
                .WithAnimationFromChart(chart)
                .CompleteCurrentTransitions();
        }

        // force the background to have at least an invisible geometry
        // we use this geometry in the motion canvas to track the position
        // of the stack panel as the time and animations elapse.
        this.BackgroundPaint ??= LiveChartsCore.LiveCharts.DefaultSettings
            .GetProvider<TDrawingContext>()
            .GetSolidColorPaint(new LiveChartsCore.LvcColor(0, 0, 0, 0));

        chart.Canvas.AddDrawableTask(this.BackgroundPaint);
        this._backgroundGeometry.X = this._targetPosition.X;
        this._backgroundGeometry.Y = this._targetPosition.Y;
        this._backgroundGeometry.Width = controlSize.Width;
        this._backgroundGeometry.Height = controlSize.Height;
        this.BackgroundPaint.AddGeometryToPaintTask(chart.Canvas, this._backgroundGeometry);

        if (this.Orientation == LiveChartsCore.ContainerOrientation.Horizontal) {
            for (const child of this.Children) {
                child.Measure(chart, primaryScaler, secondaryScaler);
                let childSize = child.GetTargetSize();

                if (this._backgroundGeometry == null)
                    throw new System.Exception("Background is required.");
                child._parent = this._backgroundGeometry;

                child._xc = this._targetPosition.X;
                child._yc = this._targetPosition.Y;

                child._x = xl;
                child._y = this.VerticalAlignment == LiveChartsCore.Align.Middle
                    ? yl + (controlSize.Height - this.Padding.Top - this.Padding.Bottom - childSize.Height) / 2
                    : this.VerticalAlignment == LiveChartsCore.Align.End
                        ? yl + controlSize.Height - this.Padding.Top - this.Padding.Bottom - childSize.Height
                        : yl;

                child.OnInvalidated(chart, primaryScaler, secondaryScaler);

                xl += childSize.Width;
            }
        } else {
            for (const child of this.Children) {
                child.Measure(chart, primaryScaler, secondaryScaler);
                let childSize = child.GetTargetSize();

                if (this._backgroundGeometry == null)
                    throw new System.Exception("Background is required.");
                child._parent = this._backgroundGeometry;

                child._xc = this._targetPosition.X;
                child._yc = this._targetPosition.Y;

                child._x = this.HorizontalAlignment == LiveChartsCore.Align.Middle
                    ? xl + (controlSize.Width - this.Padding.Left - this.Padding.Right - childSize.Width) / 2
                    : this.HorizontalAlignment == LiveChartsCore.Align.End
                        ? xl + controlSize.Width - this.Padding.Left - this.Padding.Right - childSize.Width
                        : xl;
                child._y = yl;

                child.OnInvalidated(chart, primaryScaler, secondaryScaler);

                yl += childSize.Height;
            }
        }
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._backgroundPaint];
    }
}
