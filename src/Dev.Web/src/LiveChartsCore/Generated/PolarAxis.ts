import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class PolarAxis<TDrawingContext extends LiveChartsCore.DrawingContext, TTextGeometry extends LiveChartsCore.ILabelGeometry<TDrawingContext>, TLineGeometry extends LiveChartsCore.ILineGeometry<TDrawingContext>, TCircleGeometry extends LiveChartsCore.ISizedGeometry<TDrawingContext>> extends LiveChartsCore.ChartElement<TDrawingContext> implements LiveChartsCore.IPolarAxis, LiveChartsCore.IPlane1<TDrawingContext>, System.INotifyPropertyChanged {
    private static readonly $meta_System_INotifyPropertyChanged = true;

    protected readonly _textGeometryFactory: System.Func1<TTextGeometry>;
    protected readonly _lineGeometryFactory: System.Func1<TLineGeometry>;
    protected readonly _circleGeometryFactory: System.Func1<TCircleGeometry>;

    protected constructor(textGeometryFactory: System.Func1<TTextGeometry>, lineGeometryFactory: System.Func1<TLineGeometry>, circleGeometryFactory: System.Func1<TCircleGeometry>) {
        super();
        this._textGeometryFactory = textGeometryFactory;
        this._lineGeometryFactory = lineGeometryFactory;
        this._circleGeometryFactory = circleGeometryFactory;
    }


    protected readonly activeSeparators: System.Dictionary<LiveChartsCore.IChart, System.Dictionary<number, LiveChartsCore.IVisualSeparator<TDrawingContext>>> = new System.Dictionary();

    public _orientation: LiveChartsCore.PolarAxisOrientation = 0;
    private _minStep: number = 0;
    private _dataBounds: Nullable<LiveChartsCore.Bounds> = null;
    private _visibleDataBounds: Nullable<LiveChartsCore.Bounds> = null;
    private _labelsRotation: number = 0;
    //private TTextGeometry? _nameGeometry;
    private _labeler: System.Func2<number, string> = LiveChartsCore.Labelers.Default;
    private _minLimit: Nullable<number> = null;
    private _maxLimit: Nullable<number> = null;
    private _namePaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _nameTextSize: number = 20;
    private _namePadding: LiveChartsCore.Padding = LiveChartsCore.Padding.All(5);
    private _labelsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _unitWidth: number = 1;
    private _textSize: number = 16;
    private _separatorsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _showSeparatorLines: boolean = true;
    private _isVisible: boolean = true;
    private _isInverted: boolean = false;
    private _forceStepToMin: boolean = false;
    private _labelsAngle: number = 0;
    private _labelsPadding: LiveChartsCore.Padding = LiveChartsCore.Padding.All(3);
    private _labelsVerticalAlign: LiveChartsCore.Align = LiveChartsCore.Align.Middle;
    private _labelsHorizontalAlign: LiveChartsCore.Align = LiveChartsCore.Align.Middle;
    private _labelsBackground: LiveChartsCore.LvcColor = (new LiveChartsCore.LvcColor(255, 255, 255)).Clone();
    private _animatableBounds: LiveChartsCore.AnimatableAxisBounds = new LiveChartsCore.AnimatableAxisBounds();


    Ro: number = 0;

    public get DataBounds(): LiveChartsCore.Bounds {
        if (this._dataBounds == null)
            throw new System.Exception("bounds not found");
        return this._dataBounds;
    }

    public get VisibleDataBounds(): LiveChartsCore.Bounds {
        if (this._visibleDataBounds == null)
            throw new System.Exception("bounds not found");
        return this._visibleDataBounds;
    }

    public get ActualBounds(): LiveChartsCore.AnimatableAxisBounds {
        return this._animatableBounds;
    }

    public Name: Nullable<string> = null;

    public get NameTextSize(): number {
        return this._nameTextSize;
    }

    public set NameTextSize(value: number) {
        this.SetProperty(new System.Ref(() => this._nameTextSize, $v => this._nameTextSize = $v), value);
    }

    public get NamePadding(): LiveChartsCore.Padding {
        return this._namePadding;
    }

    public set NamePadding(value: LiveChartsCore.Padding) {
        this.SetProperty(new System.Ref(() => this._namePadding, $v => this._namePadding = $v), value);
    }

    public get Orientation(): LiveChartsCore.PolarAxisOrientation {
        return this._orientation;
    }

    public get LabelsAngle(): number {
        return this._labelsAngle;
    }

    public set LabelsAngle(value: number) {
        this.SetProperty(new System.Ref(() => this._labelsAngle, $v => this._labelsAngle = $v), value);
    }

    public get Labeler(): System.Func2<number, string> {
        return this._labeler;
    }

    public set Labeler(value: System.Func2<number, string>) {
        this.SetProperty(new System.Ref(() => this._labeler, $v => this._labeler = $v), value);
    }

    public get MinStep(): number {
        return this._minStep;
    }

    public set MinStep(value: number) {
        this.SetProperty(new System.Ref(() => this._minStep, $v => this._minStep = $v), value);
    }

    public get ForceStepToMin(): boolean {
        return this._forceStepToMin;
    }

    public set ForceStepToMin(value: boolean) {
        this.SetProperty(new System.Ref(() => this._forceStepToMin, $v => this._forceStepToMin = $v), value);
    }

    public get MinLimit(): Nullable<number> {
        return this._minLimit;
    }

    public set MinLimit(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._minLimit, $v => this._minLimit = $v), value);
    }

    public get MaxLimit(): Nullable<number> {
        return this._maxLimit;
    }

    public set MaxLimit(value: Nullable<number>) {
        this.SetProperty(new System.Ref(() => this._maxLimit, $v => this._maxLimit = $v), value);
    }

    public get UnitWidth(): number {
        return this._unitWidth;
    }

    public set UnitWidth(value: number) {
        this.SetProperty(new System.Ref(() => this._unitWidth, $v => this._unitWidth = $v), value);
    }

    public get LabelsRotation(): number {
        return this._labelsRotation;
    }

    public set LabelsRotation(value: number) {
        this.SetProperty(new System.Ref(() => this._labelsRotation, $v => this._labelsRotation = $v), value);
    }

    public get TextSize(): number {
        return this._textSize;
    }

    public set TextSize(value: number) {
        this.SetProperty(new System.Ref(() => this._textSize, $v => this._textSize = $v), value);
    }

    public Labels: Nullable<System.IList<string>>;

    public get LabelsPadding(): LiveChartsCore.Padding {
        return this._labelsPadding;
    }

    public set LabelsPadding(value: LiveChartsCore.Padding) {
        this.SetProperty(new System.Ref(() => this._labelsPadding, $v => this._labelsPadding = $v), value);
    }

    public get LabelsVerticalAlignment(): LiveChartsCore.Align {
        return this._labelsVerticalAlign;
    }

    public set LabelsVerticalAlignment(value: LiveChartsCore.Align) {
        this.SetProperty(new System.Ref(() => this._labelsVerticalAlign, $v => this._labelsVerticalAlign = $v), value);
    }

    public get LabelsHorizontalAlignment(): LiveChartsCore.Align {
        return this._labelsHorizontalAlign;
    }

    public set LabelsHorizontalAlignment(value: LiveChartsCore.Align) {
        this.SetProperty(new System.Ref(() => this._labelsHorizontalAlign, $v => this._labelsHorizontalAlign = $v), value);
    }

    public get LabelsBackground(): LiveChartsCore.LvcColor {
        return this._labelsBackground;
    }

    public set LabelsBackground(value: LiveChartsCore.LvcColor) {
        this.SetProperty(new System.Ref(() => this._labelsBackground, $v => this._labelsBackground = $v), (value).Clone());
    }

    public get ShowSeparatorLines(): boolean {
        return this._showSeparatorLines;
    }

    public set ShowSeparatorLines(value: boolean) {
        this.SetProperty(new System.Ref(() => this._showSeparatorLines, $v => this._showSeparatorLines = $v), value);
    }

    public get IsVisible(): boolean {
        return this._isVisible;
    }

    public set IsVisible(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isVisible, $v => this._isVisible = $v), value);
    }

    public get IsInverted(): boolean {
        return this._isInverted;
    }

    public set IsInverted(value: boolean) {
        this.SetProperty(new System.Ref(() => this._isInverted, $v => this._isInverted = $v), value);
    }

    public get NamePaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._namePaint;
    }

    public set NamePaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._namePaint, $v => this._namePaint = $v), value);
    }

    public get LabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._labelsPaint;
    }

    public set LabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._labelsPaint, $v => this._labelsPaint = $v), value);
    }

    public get SeparatorsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._separatorsPaint;
    }

    public set SeparatorsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._separatorsPaint, $v => this._separatorsPaint = $v), value, true);
    }

    public AnimationsSpeed: Nullable<System.TimeSpan>;

    public EasingFunction: Nullable<System.Func2<number, number>>;


    public readonly Initialized = new System.Event<LiveChartsCore.IPolarAxis>();

    Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let separators: any;
        let polarChart = <LiveChartsCore.PolarChart<TDrawingContext>><unknown>chart;

        if (this._dataBounds == null) throw new System.Exception("DataBounds not found");

        let controlSize = (polarChart.ControlSize).Clone();
        let drawLocation = (polarChart.DrawMarginLocation).Clone();
        let drawMarginSize = (polarChart.DrawMarginSize).Clone();

        let axisTick = LiveChartsCore.Extensions.GetTickForPolar(this, polarChart);

        let labeler = this.Labeler;
        if (this.Labels != null) {
            labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            this._minStep = 1;
        }

        let s = axisTick.Value;
        if (s < this._minStep) s = this._minStep;
        if (this._forceStepToMin) s = this._minStep;

        if (!this._animatableBounds.HasPreviousState) {
            LiveChartsCore.Extensions.TransitionateProperties(this._animatableBounds
                , "_animatableBounds.MinLimit", "_animatableBounds.MaxLimit")
                .WithAnimationBuilder(animation =>
                    animation
                        .WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed)
                        .WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));
            polarChart.Canvas.Trackers.Add(this._animatableBounds);
        }

        if (this.NamePaint != null) {
            if (this.NamePaint.ZIndex == 0) this.NamePaint.ZIndex = -1;
            polarChart.Canvas.AddDrawableTask(this.NamePaint);
        }
        if (this.LabelsPaint != null) {
            if (this.LabelsPaint.ZIndex == 0) this.LabelsPaint.ZIndex = -0.9;
            polarChart.Canvas.AddDrawableTask(this.LabelsPaint);
        }
        if (this.SeparatorsPaint != null) {
            if (this.SeparatorsPaint.ZIndex == 0) this.SeparatorsPaint.ZIndex = -1;
            this.SeparatorsPaint.SetClipRectangle(polarChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            polarChart.Canvas.AddDrawableTask(this.SeparatorsPaint);
        }

        let a: LiveChartsCore.IPolarAxis;
        let b: LiveChartsCore.IPolarAxis;

        if (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle) {
            a = this;
            b = polarChart.RadiusAxes[0];
        } else {
            a = polarChart.AngleAxes[0];
            b = this;
        }

        let scaler = new LiveChartsCore.PolarScaler((polarChart.DrawMarginLocation).Clone(), (polarChart.DrawMarginSize).Clone(), a, b,
            polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);

        let size = <number><unknown>this.TextSize;

        let r = <number><unknown>this._labelsRotation;
        let isTangent = false;
        let isCotangent = false;

        if (((Math.floor(r) & 0xFFFFFFFF) & LiveChartsCore.LiveCharts.TangentAngle) != 0) {
            r -= LiveChartsCore.LiveCharts.TangentAngle;
            isTangent = true;
        }

        if (((Math.floor(r) & 0xFFFFFFFF) & LiveChartsCore.LiveCharts.CotangentAngle) != 0) {
            r -= LiveChartsCore.LiveCharts.CotangentAngle;
            isCotangent = true;
        }

        let hasRotation = Math.abs(r) > 0.01;

        let max = this.MaxLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Max : this.MaxLimit;
        let min = this.MinLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Min : this.MinLimit;

        let start = Math.trunc(min / s) * s;

        if (!this.activeSeparators.TryGetValue(polarChart, new System.Out(() => separators, $v => separators = $v))) {
            separators = new System.Dictionary<number, LiveChartsCore.IVisualSeparator<TDrawingContext>>();
            this.activeSeparators.SetAt(polarChart, separators);
        }

        let measured = new System.HashSet<LiveChartsCore.IVisualSeparator<TDrawingContext>>();

        for (let i = start; i <= max; i += s) {
            let visualSeparator: any;
            if (i < min) continue;

            //if (_orientation == PolarAxisOrientation.Angle && Math.Abs(scaler.GetAngle(i) - b.LabelsAngle) < 10)
            //    continue;

            // - 1d + 1d is a dummy operation to fix a bug
            // where i == 0 then calling i.ToString() returns "-0"...
            // that dummy operation seems to hide that issue
            // I am not completly sure of what causes that
            // it seems that the bits storing that number (i) have the negative bit on
            let label = labeler(i - 1 + 1);

            if (!separators.TryGetValue(i, new System.Out(() => visualSeparator, $v => visualSeparator = $v))) {
                visualSeparator = this._orientation == LiveChartsCore.PolarAxisOrientation.Angle
                    ? new LiveChartsCore.AxisVisualSeprator<TDrawingContext>().Init({Value: i})
                    : new LiveChartsCore.RadialAxisVisualSeparator<TDrawingContext>().Init({Value: i});

                let l = (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle
                    ? scaler.ToPixels(visualSeparator.Value, scaler.MaxRadius)
                    : scaler.ToPixelsWithAngleInDegrees(<number><unknown>this.LabelsAngle, visualSeparator.Value)).Clone();

                if (this.LabelsPaint != null) {
                    let textGeometry = this._textGeometryFactory(); //new TTextGeometry { TextSize = size };
                    textGeometry.TextSize = size;
                    visualSeparator.Label = textGeometry;
                    if (hasRotation) textGeometry.RotateTransform = r;
                    LiveChartsCore.Extensions.TransitionateProperties(
                        textGeometry
                        , "textGeometry.X",
                        "textGeometry.Y",
                        "textGeometry.RotateTransform",
                        "textGeometry.Opacity")
                        .WithAnimationBuilder(animation =>
                            animation
                                .WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed)
                                .WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));

                    textGeometry.X = l.X;
                    textGeometry.Y = l.Y;
                    textGeometry.Opacity = 0;
                    textGeometry.CompleteTransition(null);
                }

                if (this.SeparatorsPaint != null && this.ShowSeparatorLines) {
                    if (visualSeparator instanceof LiveChartsCore.AxisVisualSeprator<TDrawingContext>) {
                        const linearSeparator = visualSeparator;
                        let lineGeometry = this._lineGeometryFactory(); //new TLineGeometry();

                        linearSeparator.Separator = lineGeometry;
                        LiveChartsCore.Extensions.TransitionateProperties(
                            lineGeometry
                            , "lineGeometry.X", "lineGeometry.X1",
                            "lineGeometry.Y", "lineGeometry.Y1",
                            "lineGeometry.Opacity")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed)
                                    .WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));

                        lineGeometry.Opacity = 0;
                        lineGeometry.CompleteTransition(null);
                    }

                    if (visualSeparator instanceof LiveChartsCore.RadialAxisVisualSeparator<TDrawingContext>) {
                        const polarSeparator = visualSeparator;
                        let circleGeometry = this._circleGeometryFactory(); //new TCircleGeometry();

                        polarSeparator.Circle = circleGeometry;
                        LiveChartsCore.Extensions.TransitionateProperties(
                            circleGeometry
                            , "circleGeometry.X", "circleGeometry.Y",
                            "circleGeometry.Width", "circleGeometry.Height",
                            "circleGeometry.Opacity")
                            .WithAnimationBuilder(animation =>
                                animation
                                    .WithDuration(this.AnimationsSpeed ?? polarChart.AnimationsSpeed)
                                    .WithEasingFunction(this.EasingFunction ?? polarChart.EasingFunction));

                        let h = Math.sqrt(Math.pow(l.X - scaler.CenterX, 2) + Math.pow(l.Y - scaler.CenterY, 2));
                        let radius = <number><unknown>h;
                        polarSeparator.Circle.X = scaler.CenterX - radius;
                        polarSeparator.Circle.Y = scaler.CenterY - radius;
                        polarSeparator.Circle.Width = radius * 2;
                        polarSeparator.Circle.Height = radius * 2;
                        circleGeometry.Opacity = 0;
                        circleGeometry.CompleteTransition(null);
                    }
                }

                separators.Add(i, visualSeparator);
            }

            if (this.SeparatorsPaint != null && this.ShowSeparatorLines && visualSeparator.Geometry != null)
                this.SeparatorsPaint.AddGeometryToPaintTask(polarChart.Canvas, visualSeparator.Geometry);
            if (this.LabelsPaint != null && visualSeparator.Label != null)
                this.LabelsPaint.AddGeometryToPaintTask(polarChart.Canvas, visualSeparator.Label);

            let location = (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle
                ? scaler.ToPixels(visualSeparator.Value, scaler.MaxRadius)
                : scaler.ToPixelsWithAngleInDegrees(<number><unknown>this.LabelsAngle, visualSeparator.Value)).Clone();

            if (visualSeparator.Label != null) {
                visualSeparator.Label.Text = label;
                visualSeparator.Label.Padding = this._labelsPadding;
                visualSeparator.Label.HorizontalAlign = this._labelsHorizontalAlign;
                visualSeparator.Label.VerticalAlign = this._labelsVerticalAlign;

                let actualRotation = r + (isTangent ? scaler.GetAngle(i) - 90 : 0) + (isCotangent ? scaler.GetAngle(i) : 0);

                visualSeparator.Label.X = location.X;
                visualSeparator.Label.Y = location.Y;
                visualSeparator.Label.Background = (this._labelsBackground).Clone();

                if (actualRotation < 0) actualRotation = 360 + actualRotation % 360;
                if (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle && ((actualRotation + 90) % 360) > 180)
                    actualRotation += 180;

                visualSeparator.Label.RotateTransform = actualRotation;
                visualSeparator.Label.Opacity = System.IsNullOrEmpty(label) ? 0 : 1; // workaround to prevent the last label overlaps the first label

                visualSeparator.Label.X = location.X;
                visualSeparator.Label.Y = location.Y;

                if (!this._animatableBounds.HasPreviousState) visualSeparator.Label.CompleteTransition(null);
            }

            if (visualSeparator.Geometry != null) {
                if (visualSeparator instanceof LiveChartsCore.AxisVisualSeprator<TDrawingContext>) {
                    const lineSepartator = visualSeparator;
                    if (lineSepartator.Separator != null) {
                        let innerPos = scaler.ToPixels(visualSeparator.Value, scaler.MinRadius);

                        lineSepartator.Separator.X = innerPos.X;
                        lineSepartator.Separator.X1 = location.X;
                        lineSepartator.Separator.Y = innerPos.Y;
                        lineSepartator.Separator.Y1 = location.Y;

                        if (!this._animatableBounds.HasPreviousState) lineSepartator.Separator.CompleteTransition(null);
                    }
                }

                if (visualSeparator instanceof LiveChartsCore.RadialAxisVisualSeparator<TDrawingContext>) {
                    const polarSeparator = visualSeparator;
                    if (polarSeparator.Circle != null) {
                        let h = Math.sqrt(Math.pow(location.X - scaler.CenterX, 2) +
                            Math.pow(location.Y - scaler.CenterY, 2));
                        let radius = <number><unknown>h;
                        polarSeparator.Circle.X = scaler.CenterX - radius;
                        polarSeparator.Circle.Y = scaler.CenterY - radius;
                        polarSeparator.Circle.Width = radius * 2;
                        polarSeparator.Circle.Height = radius * 2;

                        if (!this._animatableBounds.HasPreviousState) polarSeparator.Circle.CompleteTransition(null);
                    }
                }

                visualSeparator.Geometry.Opacity = 1;
            }

            if (visualSeparator.Label != null || visualSeparator.Geometry != null) measured.Add(visualSeparator);
        }

        for (const separator of separators) {
            if (measured.Contains(separator.Value)) continue;

            this.SoftDeleteSeparator(polarChart, separator.Value, scaler);
            separators.Remove(separator.Key);
        }
    }

    public GetNameLabelSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize {
        if (this.NamePaint == null || System.IsNullOrEmpty(this.Name)) return new LiveChartsCore.LvcSize(0, 0);

        // var textGeometry = new TTextGeometry
        // {
        //     Text = Name ?? string.Empty,
        //     TextSize = (float)NameTextSize,
        //     Padding = _labelsPadding
        // };
        let textGeometry = this._textGeometryFactory();
        textGeometry.Text = this.Name ?? '';
        textGeometry.TextSize = <number><unknown>this.NameTextSize;
        textGeometry.Padding = this._labelsPadding;

        return textGeometry.Measure(this.NamePaint);
    }

    public GetPossibleSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize {
        if (this._dataBounds == null) throw new System.Exception("DataBounds not found");
        if (this.LabelsPaint == null) return new LiveChartsCore.LvcSize(0, 0);

        let ts = <number><unknown>this.TextSize;
        let labeler = this.Labeler;
        let polarChart = <LiveChartsCore.PolarChart<TDrawingContext>><unknown>chart;
        let a: LiveChartsCore.IPolarAxis;
        let b: LiveChartsCore.IPolarAxis;

        if (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle) {
            a = this;
            b = polarChart.RadiusAxes[0];
        } else {
            a = polarChart.AngleAxes[0];
            b = this;
        }
        let scaler = new LiveChartsCore.PolarScaler((polarChart.DrawMarginLocation).Clone(), (polarChart.DrawMarginSize).Clone(), a, b,
            polarChart.InnerRadius, polarChart.InitialRotation, polarChart.TotalAnge);

        if (this.Labels != null) {
            labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            this._minStep = 1;
        }

        let axisTick = LiveChartsCore.Extensions.GetTickForPolar(this, polarChart);
        let s = axisTick.Value;
        if (s < this._minStep) s = this._minStep;
        if (this._forceStepToMin) s = this._minStep;

        let max = this.MaxLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Max : this.MaxLimit;
        let min = this.MinLimit == null ? (this._visibleDataBounds ?? this._dataBounds).Min : this.MinLimit;

        let start = Math.trunc(min / s) * s;

        let totalH = 0;
        let r = <number><unknown>this.LabelsRotation;

        for (let i = start; i <= max; i += s) {
            // var textGeometry = new TTextGeometry
            // {
            //     Text = labeler(i),
            //     TextSize = ts,
            //     RotateTransform = r + (_orientation == PolarAxisOrientation.Angle ? scaler.GetAngle(i) - 90 : 0),
            //     Padding = _labelsPadding
            // };
            let textGeometry = this._textGeometryFactory();
            textGeometry.Text = labeler(i);
            textGeometry.TextSize = ts;
            textGeometry.RotateTransform =
                r + (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle ? scaler.GetAngle(i) - 90 : 0);
            textGeometry.Padding = this._labelsPadding;
            let m = textGeometry.Measure(this.LabelsPaint); // TextBrush.MeasureText(labeler(i, axisTick));

            let h = <number><unknown>Math.sqrt(Math.pow(m.Width * 0.5, 2) + Math.pow(m.Height * 0.5, 2));
            if (h > totalH) totalH = h;
        }

        return new LiveChartsCore.LvcSize(0, totalH);
    }

    Initialize(orientation: LiveChartsCore.PolarAxisOrientation) {
        this._orientation = orientation;
        this._animatableBounds ??= new LiveChartsCore.AnimatableAxisBounds();
        this._dataBounds = new LiveChartsCore.Bounds();
        this._visibleDataBounds = new LiveChartsCore.Bounds();
        this.Initialized.Invoke(this);
    }

    public Delete(chart: LiveChartsCore.Chart<TDrawingContext>) {
        if (this._labelsPaint != null) {
            chart.Canvas.RemovePaintTask(this._labelsPaint);
            this._labelsPaint.ClearGeometriesFromPaintTask(chart.Canvas);
        }
        if (this._separatorsPaint != null) {
            chart.Canvas.RemovePaintTask(this._separatorsPaint);
            this._separatorsPaint.ClearGeometriesFromPaintTask(chart.Canvas);
        }

        this.activeSeparators.Remove(chart);
    }

    RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        super.RemoveFromUI(chart);
        this._animatableBounds = null!;
        this.activeSeparators.Remove(chart);
    }

    protected SoftDeleteSeparator(chart: LiveChartsCore.Chart<TDrawingContext>,
                                  separator: LiveChartsCore.IVisualSeparator<TDrawingContext>,
                                  scaler: LiveChartsCore.PolarScaler) {
        if (separator.Geometry == null) return;

        let location = (this._orientation == LiveChartsCore.PolarAxisOrientation.Angle
            ? scaler.ToPixels(separator.Value, scaler.MaxRadius)
            : scaler.ToPixels(0, separator.Value)).Clone();

        if (separator instanceof LiveChartsCore.AxisVisualSeprator<TDrawingContext>) {
            const lineSeparator = separator;
            lineSeparator.Separator!.X = scaler.CenterX;
            lineSeparator.Separator.Y = scaler.CenterY;
            lineSeparator.Separator.X1 = location.X;
            lineSeparator.Separator.Y1 = location.Y;
        }

        if (separator instanceof LiveChartsCore.RadialAxisVisualSeparator<TDrawingContext>) {
            const polarSeparator = separator;
            polarSeparator.Circle!.X = scaler.CenterX;
            polarSeparator.Circle.Y = scaler.CenterY;
            polarSeparator.Circle.Width = 0;
            polarSeparator.Circle.Height = 0;
        }

        separator.Geometry.Opacity = 0;
        separator.Geometry.RemoveOnCompleted = true;

        if (separator.Label != null) {
            //separator.Text.X = 0;
            //separator.Text.Y = 0;
            separator.Label.Opacity = 0;
            separator.Label.RemoveOnCompleted = true;
        }
    }

    OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._separatorsPaint, this._labelsPaint, this._namePaint];
    }
}
