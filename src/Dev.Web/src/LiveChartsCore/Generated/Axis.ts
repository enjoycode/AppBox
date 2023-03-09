import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Axis<TDrawingContext extends LiveChartsCore.DrawingContext, TTextGeometry extends LiveChartsCore.ILabelGeometry<TDrawingContext>, TLineGeometry extends object & LiveChartsCore.ILineGeometry<TDrawingContext>> extends LiveChartsCore.ChartElement<TDrawingContext> implements LiveChartsCore.ICartesianAxis1<TDrawingContext>, LiveChartsCore.IPlane1<TDrawingContext> {
    protected constructor(textGeometryFactory: System.Func1<TTextGeometry>, lineGeometryFactory: System.Func1<TLineGeometry>) {
        super();
        this._textGeometryFactory = textGeometryFactory;
        this._lineGeometryFactory = lineGeometryFactory;
    }

    private readonly _textGeometryFactory: System.Func1<TTextGeometry>;
    private readonly _lineGeometryFactory: System.Func1<TLineGeometry>;


    protected readonly activeSeparators: System.Dictionary<LiveChartsCore.IChart, System.Dictionary<string, LiveChartsCore.AxisVisualSeprator<TDrawingContext>>> = new System.Dictionary();

    public _xo: number = 0;
    public _yo: number = 0;
    public _size: LiveChartsCore.LvcSize = LiveChartsCore.LvcSize.Empty.Clone();
    public _orientation: LiveChartsCore.AxisOrientation = 0;
    public _animatableBounds: LiveChartsCore.AnimatableAxisBounds = new LiveChartsCore.AnimatableAxisBounds();
    public _dataBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();
    public _visibleDataBounds: LiveChartsCore.Bounds = new LiveChartsCore.Bounds();

    private _minStep: number = 0;
    private _labelsRotation: number = 0;
    private _labelsDesiredSize: LiveChartsCore.LvcRectangle = LiveChartsCore.LvcRectangle.Empty.Clone();
    private _nameDesiredSize: LiveChartsCore.LvcRectangle = LiveChartsCore.LvcRectangle.Empty.Clone();
    private _nameGeometry: Nullable<TTextGeometry>;
    private _position: LiveChartsCore.AxisPosition = LiveChartsCore.AxisPosition.Start;
    private _labeler: System.Func2<number, string> = LiveChartsCore.Labelers.Default;
    private _padding: LiveChartsCore.Padding = LiveChartsCore.Padding.Default;
    private _minLimit: Nullable<number> = null;
    private _maxLimit: Nullable<number> = null;
    private _namePaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _nameTextSize: number = 20;
    private _namePadding: LiveChartsCore.Padding = LiveChartsCore.Padding.All(5);
    private _labelsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _unitWidth: number = 1;
    private _textSize: number = 16;
    private _separatorsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _subseparatorsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _drawTicksPath: boolean = false;
    private _ticksPath: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>>;
    private _ticksPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _subticksPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _zeroPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _zeroLine: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>>;
    private _crosshairLine: Nullable<LiveChartsCore.ILineGeometry<TDrawingContext>>;
    private _crosshairLabel: Nullable<LiveChartsCore.ILabelGeometry<TDrawingContext>>;
    private _crosshairPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _crosshairLabelsPaint: Nullable<LiveChartsCore.IPaint<TDrawingContext>>;
    private _showSeparatorLines: boolean = true;
    private _isVisible: boolean = true;
    private _isInverted: boolean = false;
    private _separatorsAtCenter: boolean = true;
    private _ticksAtCenter: boolean = true;
    private _forceStepToMin: boolean = false;
    private _crosshairSnapEnabled: boolean = false;
    private readonly _tickLength: number = 6;
    private readonly _subSections: number = 3;
    private _labelsAlignment: Nullable<LiveChartsCore.Align>;
    private _inLineNamePlacement: boolean = false;


    get Xo(): number {
        return this._xo;
    }

    set Xo(value: number) {
        this._xo = value;
    }

    get Yo(): number {
        return this._yo;
    }

    set Yo(value: number) {
        this._yo = value;
    }

    get Size(): LiveChartsCore.LvcSize {
        return this._size;
    }

    set Size(value: LiveChartsCore.LvcSize) {
        this._size = (value).Clone();
    }

    get LabelsDesiredSize(): LiveChartsCore.LvcRectangle {
        return this._labelsDesiredSize;
    }

    set LabelsDesiredSize(value: LiveChartsCore.LvcRectangle) {
        this._labelsDesiredSize = (value).Clone();
    }

    get NameDesiredSize(): LiveChartsCore.LvcRectangle {
        return this._nameDesiredSize;
    }

    set NameDesiredSize(value: LiveChartsCore.LvcRectangle) {
        this._nameDesiredSize = (value).Clone();
    }

    public get DataBounds(): LiveChartsCore.Bounds {
        return this._dataBounds;
    }

    public get VisibleDataBounds(): LiveChartsCore.Bounds {
        return this._visibleDataBounds;
    }

    get ActualBounds():
        LiveChartsCore.AnimatableAxisBounds {
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

    public get LabelsAlignment(): Nullable<LiveChartsCore.Align> {
        return this._labelsAlignment;
    }

    public set LabelsAlignment(value: Nullable<LiveChartsCore.Align>) {
        this.SetProperty(new System.Ref(() => this._labelsAlignment, $v => this._labelsAlignment = $v), value);
    }

    public get Orientation(): LiveChartsCore.AxisOrientation {
        return this._orientation;
    }

    public get Padding(): LiveChartsCore.Padding {
        return this._padding;
    }

    public set Padding(value: LiveChartsCore.Padding) {
        this.SetProperty(new System.Ref(() => this._padding, $v => this._padding = $v), value);
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

    public get Position(): LiveChartsCore.AxisPosition {
        return this._position;
    }

    public set Position(value: LiveChartsCore.AxisPosition) {
        this.SetProperty(new System.Ref(() => this._position, $v => this._position = $v), value);
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

    public get SeparatorsAtCenter(): boolean {
        return this._separatorsAtCenter;
    }

    public set SeparatorsAtCenter(value: boolean) {
        this.SetProperty(new System.Ref(() => this._separatorsAtCenter, $v => this._separatorsAtCenter = $v), value);
    }

    public get TicksAtCenter(): boolean {
        return this._ticksAtCenter;
    }

    public set TicksAtCenter(value: boolean) {
        this.SetProperty(new System.Ref(() => this._ticksAtCenter, $v => this._ticksAtCenter = $v), value);
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

    public get SubseparatorsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._subseparatorsPaint;
    }

    public set SubseparatorsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._subseparatorsPaint, $v => this._subseparatorsPaint = $v), value, true);
    }

    public get DrawTicksPath(): boolean {
        return this._drawTicksPath;
    }

    public set DrawTicksPath(value: boolean) {
        this.SetProperty(new System.Ref(() => this._drawTicksPath, $v => this._drawTicksPath = $v), value);
    }

    public get TicksPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._ticksPaint;
    }

    public set TicksPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._ticksPaint, $v => this._ticksPaint = $v), value, true);
    }

    public get SubticksPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._subticksPaint;
    }

    public set SubticksPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._subticksPaint, $v => this._subticksPaint = $v), value, true);
    }

    public get ZeroPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._zeroPaint;
    }

    public set ZeroPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._zeroPaint, $v => this._zeroPaint = $v), value, true);
    }

    public get CrosshairPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._crosshairPaint;
    }

    public set CrosshairPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._crosshairPaint, $v => this._crosshairPaint = $v), value, true);
    }

    public get CrosshairLabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this._crosshairLabelsPaint;
    }

    public set CrosshairLabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._crosshairLabelsPaint, $v => this._crosshairLabelsPaint = $v), value);
    }

    public CrosshairLabelsBackground: Nullable<LiveChartsCore.LvcColor>;

    public CrosshairPadding: Nullable<LiveChartsCore.Padding>;

    public get CrosshairSnapEnabled(): boolean {
        return this._crosshairSnapEnabled;
    }

    public set CrosshairSnapEnabled(value: boolean) {
        this.SetProperty(new System.Ref(() => this._crosshairSnapEnabled, $v => this._crosshairSnapEnabled = $v), value);
    }

    public get TextBrush(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this.LabelsPaint;
    }

    public set TextBrush(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.LabelsPaint = value;
    }

    public get SeparatorsBrush(): Nullable<LiveChartsCore.IPaint<TDrawingContext>> {
        return this.SeparatorsPaint;
    }

    public set SeparatorsBrush(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>) {
        this.SeparatorsPaint = value;
    }

    public AnimationsSpeed: Nullable<System.TimeSpan>;

    public EasingFunction: Nullable<System.Func2<number, number>>;

    public MinZoomDelta: Nullable<number>;

    public get InLineNamePlacement(): boolean {
        return this._inLineNamePlacement;
    }

    public set InLineNamePlacement(value: boolean) {
        this.SetProperty(new System.Ref(() => this._inLineNamePlacement, $v => this._inLineNamePlacement = $v), value);
    }

    public readonly Initialized = new System.Event<LiveChartsCore.ICartesianAxis>();

    public Invalidate(chart: LiveChartsCore.Chart<TDrawingContext>) {
        let separators: any;

        let cartesianChart = <LiveChartsCore.CartesianChart<TDrawingContext>><unknown>chart;

        let controlSize = (cartesianChart.ControlSize).Clone();
        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();

        let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
        let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;

        this._animatableBounds.MaxVisibleBound = max;
        this._animatableBounds.MinVisibleBound = min;

        if (!this._animatableBounds.HasPreviousState) {
            LiveChartsCore.Extensions.TransitionateProperties(this._animatableBounds
                , null)
                .WithAnimationBuilder(animation =>
                    animation
                        .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                        .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction))
                .CompleteCurrentTransitions();
            cartesianChart.Canvas.Trackers.Add(this._animatableBounds);
        }

        let scale = LiveChartsCore.Extensions.GetNextScaler(this, cartesianChart);
        let actualScale = LiveChartsCore.Extensions.GetActualScaler(this, cartesianChart) ?? scale;

        let axisTick = LiveChartsCore.Extensions.GetTick(this, (drawMarginSize).Clone(), null, this.GetPossibleMaxLabelSize(chart));

        let labeler = this.Labeler;
        if (this.Labels != null) {
            labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            this._minStep = 1;
        }

        let s = axisTick.Value;
        if (s < this._minStep) s = this._minStep;
        if (this._forceStepToMin) s = this._minStep;

        if (this.NamePaint != null) {
            if (this.NamePaint.ZIndex == 0) this.NamePaint.ZIndex = -1;
            cartesianChart.Canvas.AddDrawableTask(this.NamePaint);
        }
        if (this.LabelsPaint != null) {
            if (this.LabelsPaint.ZIndex == 0) this.LabelsPaint.ZIndex = -0.9;
            cartesianChart.Canvas.AddDrawableTask(this.LabelsPaint);
        }
        if (this.SubseparatorsPaint != null) {
            if (this.SubseparatorsPaint.ZIndex == 0) this.SubseparatorsPaint.ZIndex = -1;
            this.SubseparatorsPaint.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.SubseparatorsPaint);
        }
        if (this.SeparatorsPaint != null) {
            if (this.SeparatorsPaint.ZIndex == 0) this.SeparatorsPaint.ZIndex = -1;
            this.SeparatorsPaint.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.SeparatorsPaint);
        }
        let ticksClipRectangle = (this._orientation == LiveChartsCore.AxisOrientation.X
            ? new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(drawLocation.X, 0), new LiveChartsCore.LvcSize(drawMarginSize.Width, controlSize.Height))
            : new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, drawLocation.Y), new LiveChartsCore.LvcSize(controlSize.Width, drawMarginSize.Height))).Clone();
        if (this.TicksPaint != null) {
            if (this.TicksPaint.ZIndex == 0) this.TicksPaint.ZIndex = -1;
            this.TicksPaint.SetClipRectangle(cartesianChart.Canvas, (ticksClipRectangle).Clone());
            cartesianChart.Canvas.AddDrawableTask(this.TicksPaint);
        }
        if (this.SubticksPaint != null) {
            if (this.SubticksPaint.ZIndex == 0) this.SubticksPaint.ZIndex = -1;
            this.SubticksPaint.SetClipRectangle(cartesianChart.Canvas, (ticksClipRectangle).Clone());
            cartesianChart.Canvas.AddDrawableTask(this.SubticksPaint);
        }

        let lyi = drawLocation.Y;
        let lyj = drawLocation.Y + drawMarginSize.Height;
        let lxi = drawLocation.X;
        let lxj = drawLocation.X + drawMarginSize.Width;

        let xoo: number = 0;
        let yoo: number = 0;

        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            yoo = this._position == LiveChartsCore.AxisPosition.Start
                ? controlSize.Height - this._yo
                : this._yo;
        } else {
            xoo = this._position == LiveChartsCore.AxisPosition.Start
                ? this._xo
                : controlSize.Width - this._xo;
        }

        let size = <number><unknown>this.TextSize;
        let r = <number><unknown>this._labelsRotation;
        let hasRotation = Math.abs(r) > 0.01;

        let start = Math.trunc(min / s) * s;
        if (!this.activeSeparators.TryGetValue(cartesianChart, new System.Out(() => separators, $v => separators = $v))) {
            separators = new System.Dictionary<string, LiveChartsCore.AxisVisualSeprator<TDrawingContext>>();
            this.activeSeparators.SetAt(cartesianChart, separators);
        }

        if (this.Name != null && this.NamePaint != null)
            this.DrawName(cartesianChart, <number><unknown>this.NameTextSize, lxi, lxj, lyi, lyj);

        if (this.NamePaint != null && this._nameGeometry != null)
            this.NamePaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._nameGeometry);

        let hasActivePaint = this.NamePadding != null || this.SeparatorsPaint != null || this.LabelsPaint != null ||
            this.TicksPaint != null || this.SubticksPaint != null || this.SubseparatorsPaint != null;

        let measured = new System.HashSet<LiveChartsCore.AxisVisualSeprator<TDrawingContext>>();

        if (this.ZeroPaint != null) {
            let x: number = 0;
            let y: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                x = scale.ToPixels(0);
                y = yoo;
            } else {
                x = xoo;
                y = scale.ToPixels(0);
            }

            if (this.ZeroPaint.ZIndex == 0) this.ZeroPaint.ZIndex = -1;
            this.ZeroPaint.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
            cartesianChart.Canvas.AddDrawableTask(this.ZeroPaint);

            if (this._zeroLine == null) {
                this._zeroLine = this._lineGeometryFactory(); //new TLineGeometry();
                this.ZeroPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._zeroLine);
                this.InitializeLine(this._zeroLine, cartesianChart);
                this.UpdateSeparator(this._zeroLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
            }

            this.UpdateSeparator(this._zeroLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.Update);
        }

        if (this.TicksPaint != null && this._drawTicksPath) {
            if (this._ticksPath == null) {
                this._ticksPath = this._lineGeometryFactory(); //new TLineGeometry();
                this.InitializeLine(this._ticksPath, cartesianChart);
            }
            this.TicksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._ticksPath);

            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                let yp = yoo + this._size.Height * 0.5 * (this._position == LiveChartsCore.AxisPosition.Start ? -1 : 1);
                this._ticksPath.X = lxi;
                this._ticksPath.X1 = lxj;
                this._ticksPath.Y = yp;
                this._ticksPath.Y1 = yp;
            } else {
                let xp = xoo + this._size.Width * 0.5 * (this._position == LiveChartsCore.AxisPosition.Start ? 1 : -1);
                this._ticksPath.X = xp;
                this._ticksPath.X1 = xp;
                this._ticksPath.Y = lyi;
                this._ticksPath.Y1 = lyj;
            }

            if (!this._animatableBounds.HasPreviousState) this._ticksPath.CompleteTransition(null);
        }
        if (this.TicksPaint != null && this._ticksPath != null && !this._drawTicksPath)
            this.TicksPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, this._ticksPath);

        let txco: number = 0;
        let tyco: number = 0;
        let sxco: number = 0;
        let syco: number = 0;

        let uw = scale.MeasureInPixels(this._unitWidth);
        if (!this._ticksAtCenter && this._orientation == LiveChartsCore.AxisOrientation.X) txco = uw * 0.5;
        if (!this._ticksAtCenter && this._orientation == LiveChartsCore.AxisOrientation.Y) tyco = uw * 0.5;
        if (!this._separatorsAtCenter && this._orientation == LiveChartsCore.AxisOrientation.X) sxco = uw * 0.5;
        if (!this._separatorsAtCenter && this._orientation == LiveChartsCore.AxisOrientation.Y) sxco = uw * 0.5;

        for (let i = start - s; i <= max + s; i += s) {
            let visualSeparator: any;
            let separatorKey = LiveChartsCore.Labelers.SixRepresentativeDigits(i - 1 + 1);
            let labelContent = i < min || i > max ? '' : this.TryGetLabelOrLogError(labeler, i - 1 + 1);

            let x: number = 0;
            let y: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                x = scale.ToPixels(i);
                y = yoo;
            } else {
                x = xoo;
                y = scale.ToPixels(i);
            }

            let xc: number = 0;
            let yc: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                xc = actualScale.ToPixels(i);
                yc = yoo;
            } else {
                xc = xoo;
                yc = actualScale.ToPixels(i);
            }

            if (!separators.TryGetValue(separatorKey, new System.Out(() => visualSeparator, $v => visualSeparator = $v))) {
                visualSeparator = new LiveChartsCore.AxisVisualSeprator<TDrawingContext>().Init({Value: i});
                separators.Add(separatorKey, visualSeparator);
            }


            if (this.SeparatorsPaint != null && this.ShowSeparatorLines && visualSeparator.Separator == null) {
                this.InitializeSeparator(visualSeparator, cartesianChart);
                this.UpdateSeparator(
                    visualSeparator.Separator!, xc + sxco, yc + syco, lxi, lxj, lyi, lyj,
                    UpdateMode.UpdateAndComplete);
            }
            if (this.SubseparatorsPaint != null && this.ShowSeparatorLines &&
                (visualSeparator.Subseparators == null || visualSeparator.Subseparators.length == 0)) {
                this.InitializeSubseparators(visualSeparator, cartesianChart);
                this.UpdateSubseparators(
                    visualSeparator.Subseparators!, actualScale, s, xc + sxco, yc + syco, lxi, lxj, lyi, lyj,
                    UpdateMode.UpdateAndComplete);
            }
            if (this.TicksPaint != null && visualSeparator.Tick == null) {
                this.InitializeTick(visualSeparator, cartesianChart);
                this.UpdateTick(visualSeparator.Tick!, this._tickLength, xc + txco, yc + tyco, UpdateMode.UpdateAndComplete);
            }
            if (this.SubticksPaint != null && this._subSections > 0 &&
                (visualSeparator.Subticks == null || visualSeparator.Subticks.length == 0)) {
                this.InitializeSubticks(visualSeparator, cartesianChart);
                this.UpdateSubticks(visualSeparator.Subticks!, actualScale, s, xc + txco, yc + tyco, UpdateMode.UpdateAndComplete);
            }
            if (this.LabelsPaint != null && visualSeparator.Label == null) {
                this.IntializeLabel(visualSeparator, cartesianChart, size, hasRotation, r);
                this.UpdateLabel(
                    visualSeparator.Label!, xc, yc, this.TryGetLabelOrLogError(labeler, i - 1 + 1), hasRotation, r,
                    UpdateMode.UpdateAndComplete);
            }


            if (this.SeparatorsPaint != null && visualSeparator.Separator != null) {
                if (this.ShowSeparatorLines)
                    this.SeparatorsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Separator);
                else
                    this.SeparatorsPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, visualSeparator.Separator);
            }

            if (this.SubseparatorsPaint != null && visualSeparator.Subseparators != null)
                if (this.ShowSeparatorLines)
                    for (const subtick of visualSeparator.Subseparators)
                        this.SubseparatorsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, subtick);
                else
                    for (const subtick of visualSeparator.Subseparators)
                        this.SubseparatorsPaint.RemoveGeometryFromPainTask(cartesianChart.Canvas, subtick);

            if (this.LabelsPaint != null && visualSeparator.Label != null)
                this.LabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Label);
            if (this.TicksPaint != null && visualSeparator.Tick != null)
                this.TicksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, visualSeparator.Tick);
            if (this.SubticksPaint != null && visualSeparator.Subticks != null)
                for (const subtick of visualSeparator.Subticks)
                    this.SubticksPaint.AddGeometryToPaintTask(cartesianChart.Canvas, subtick);

            if (visualSeparator.Separator != null)
                this.UpdateSeparator(visualSeparator.Separator, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.Update);
            if (visualSeparator.Subseparators != null)
                this.UpdateSubseparators(visualSeparator.Subseparators, scale, s, x + sxco, y + tyco, lxi, lxj, lyi, lyj, UpdateMode.Update);
            if (visualSeparator.Tick != null)
                this.UpdateTick(visualSeparator.Tick, this._tickLength, x + txco, y + tyco, UpdateMode.Update);
            if (visualSeparator.Subticks != null)
                this.UpdateSubticks(visualSeparator.Subticks, scale, s, x + txco, y + tyco, UpdateMode.Update);
            if (visualSeparator.Label != null)
                this.UpdateLabel(visualSeparator.Label, x, y + tyco, labelContent, hasRotation, r, UpdateMode.Update);

            if (hasActivePaint) measured.Add(visualSeparator);

        }

        for (const separatorValueKey of separators) {
            let separator = separatorValueKey.Value;
            if (measured.Contains(separator)) continue;

            let x: number = 0;
            let y: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                x = scale.ToPixels(separator.Value);
                y = yoo;
            } else {
                x = xoo;
                y = scale.ToPixels(separator.Value);
            }

            if (separator.Separator != null)
                this.UpdateSeparator(separator.Separator, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndRemove);
            if (separator.Subseparators != null)
                this.UpdateSubseparators(
                    separator.Subseparators, scale, s, x + sxco, y + syco, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndRemove);
            if (separator.Tick != null)
                this.UpdateTick(separator.Tick, this._tickLength, x + txco, y + tyco, UpdateMode.UpdateAndRemove);
            if (separator.Subticks != null)
                this.UpdateSubticks(separator.Subticks, scale, s, x + txco, y + tyco, UpdateMode.UpdateAndRemove);
            if (separator.Label != null)
                this.UpdateLabel(
                    separator.Label, x, y + tyco, this.TryGetLabelOrLogError(labeler, separator.Value - 1 + 1), hasRotation, r,
                    UpdateMode.UpdateAndRemove);
            separators.Remove(separatorValueKey.Key);
        }
    }

    public InvalidateCrosshair(chart: LiveChartsCore.Chart<TDrawingContext>, pointerPosition: LiveChartsCore.LvcPoint) {
        if (this.CrosshairPaint == null) return;
        let cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>;
        if (chart instanceof LiveChartsCore.CartesianChart<TDrawingContext>)
            cartesianChart = (chart as LiveChartsCore.CartesianChart<TDrawingContext>)!;
        else
            return;

        let scale = LiveChartsCore.Extensions.GetNextScaler(this, cartesianChart);
        let controlSize = (cartesianChart.ControlSize).Clone();
        let drawLocation = (cartesianChart.DrawMarginLocation).Clone();
        let drawMarginSize = (cartesianChart.DrawMarginSize).Clone();
        let labelValue: number = 0;

        let lyi = drawLocation.Y;
        let lyj = drawLocation.Y + drawMarginSize.Height;
        let lxi = drawLocation.X;
        let lxj = drawLocation.X + drawMarginSize.Width;

        let xoo: number = 0;
        let yoo: number = 0;

        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            yoo = this._position == LiveChartsCore.AxisPosition.Start
                ? controlSize.Height - this._yo
                : this._yo;
        } else {
            xoo = this._position == LiveChartsCore.AxisPosition.Start
                ? this._xo
                : controlSize.Width - this._xo;
        }

        let x: number = 0;
        let y: number = 0;
        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            let crosshairX: number = 0;
            if (this.CrosshairSnapEnabled) {
                let axisIndex = cartesianChart.XAxes.indexOf(this);
                let closestPoint = Axis.FindClosestPoint(
                    (pointerPosition).Clone(), cartesianChart, cartesianChart.Series.Where(s => s.ScalesXAt == axisIndex));

                crosshairX = scale.ToPixels(closestPoint?.SecondaryValue ?? pointerPosition.X);
                labelValue = closestPoint?.SecondaryValue ?? scale.ToChartValues(pointerPosition.X);
            } else {
                crosshairX = pointerPosition.X;
                labelValue = scale.ToChartValues(pointerPosition.X);
            }

            x = crosshairX;
            y = yoo;
        } else {
            let crosshairY: number = 0;
            if (this.CrosshairSnapEnabled) {
                let axisIndex = cartesianChart.YAxes.indexOf(this);
                let closestPoint = Axis.FindClosestPoint(
                    (pointerPosition).Clone(), cartesianChart, cartesianChart.Series.Where(s => s.ScalesYAt == axisIndex));

                crosshairY = scale.ToPixels(closestPoint?.PrimaryValue ?? pointerPosition.Y);
                labelValue = closestPoint?.PrimaryValue ?? scale.ToChartValues(pointerPosition.Y);
            } else {
                crosshairY = pointerPosition.Y;
                labelValue = scale.ToChartValues(pointerPosition.Y);
            }

            x = xoo;
            y = crosshairY;
        }

        if (this.CrosshairPaint.ZIndex == 0) this.CrosshairPaint.ZIndex = 1050;
        this.CrosshairPaint.SetClipRectangle(cartesianChart.Canvas, new LiveChartsCore.LvcRectangle((drawLocation).Clone(), (drawMarginSize).Clone()));
        cartesianChart.Canvas.AddDrawableTask(this.CrosshairPaint);

        if (this._crosshairLine == null) {
            this._crosshairLine = this._lineGeometryFactory(); //new TLineGeometry();
            this.UpdateSeparator(this._crosshairLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.UpdateAndComplete);
        }
        this.CrosshairPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._crosshairLine);

        if (this.CrosshairLabelsPaint != null) {
            if (this.CrosshairLabelsPaint.ZIndex == 0) this.CrosshairLabelsPaint.ZIndex = 1050;
            if (this.Orientation == LiveChartsCore.AxisOrientation.X) {
                this.CrosshairLabelsPaint.SetClipRectangle(
                    cartesianChart.Canvas,
                    new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(drawLocation.X, 0),
                        new LiveChartsCore.LvcSize(drawMarginSize.Width, controlSize.Height)));
            } else {
                this.CrosshairLabelsPaint.SetClipRectangle(
                    cartesianChart.Canvas,
                    new LiveChartsCore.LvcRectangle(new LiveChartsCore.LvcPoint(0, drawLocation.Y),
                        new LiveChartsCore.LvcSize(controlSize.Width, drawMarginSize.Height)));
            }
            cartesianChart.Canvas.AddDrawableTask(this.CrosshairLabelsPaint);

            this._crosshairLabel ??= this._textGeometryFactory(); //new TTextGeometry();
            let labeler = this.Labeler;
            if (this.Labels != null) {
                labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            }

            this._crosshairLabel.Text = this.TryGetLabelOrLogError(labeler, labelValue);
            this._crosshairLabel.TextSize = <number><unknown>this._textSize;
            this._crosshairLabel.Background = (this.CrosshairLabelsBackground ?? LiveChartsCore.LvcColor.Empty).Clone();
            this._crosshairLabel.Padding = this.CrosshairPadding ?? this._padding;
            this._crosshairLabel.X = x;
            this._crosshairLabel.Y = y;

            let r = <number><unknown>this._labelsRotation;
            let hasRotation = Math.abs(r) > 0.01;
            if (hasRotation) this._crosshairLabel.RotateTransform = r;
            this.CrosshairLabelsPaint.AddGeometryToPaintTask(cartesianChart.Canvas, this._crosshairLabel);
        }

        this.UpdateSeparator(this._crosshairLine, x, y, lxi, lxj, lyi, lyj, UpdateMode.Update);

        chart.Canvas.Invalidate();
    }

    private static FindClosestPoint<T extends LiveChartsCore.DrawingContext>(pointerPosition: LiveChartsCore.LvcPoint,
                                                                             cartesianChart: LiveChartsCore.CartesianChart<T>,
                                                                             allSeries: System.IEnumerable<LiveChartsCore.ICartesianSeries<T>>): Nullable<LiveChartsCore.ChartPoint> {
        let closestPoint: Nullable<LiveChartsCore.ChartPoint> = null;
        for (const series of allSeries) {
            let hitpoints = series.FindHitPoints(cartesianChart, (pointerPosition).Clone(), LiveChartsCore.Extensions.GetTooltipFindingStrategy(allSeries,));
            let hitpoint = hitpoints.FirstOrDefault();
            if (hitpoint == null) continue;

            if (closestPoint == null ||
                hitpoint.DistanceTo((pointerPosition).Clone()) < closestPoint.DistanceTo((pointerPosition).Clone())) {
                closestPoint = hitpoint;
            }
        }

        return closestPoint;
    }

    public GetNameLabelSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize {
        if (this.NamePaint == null || System.IsNullOrEmpty(this.Name)) return new LiveChartsCore.LvcSize(0, 0);

        // var textGeometry = new TTextGeometry
        // {
        //     Text = Name ?? string.Empty,
        //     TextSize = (float)_nameTextSize,
        //     RotateTransform = Orientation == AxisOrientation.X
        //         ? 0
        //         : InLineNamePlacement ? 0 : -90,
        //     Padding = NamePadding
        // };
        let textGeometry = this._textGeometryFactory();
        textGeometry.Text = this.Name ?? '';
        textGeometry.TextSize = <number><unknown>this._nameTextSize;
        textGeometry.RotateTransform = this.Orientation == LiveChartsCore.AxisOrientation.X ? 0 : this.InLineNamePlacement ? 0 : -90;
        textGeometry.Padding = this.NamePadding;

        return textGeometry.Measure(this.NamePaint);
    }

    public GetPossibleSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize {
        if (this._dataBounds == null) throw new System.Exception("DataBounds not found");
        if (this.LabelsPaint == null) return new LiveChartsCore.LvcSize(0, 0);

        let ts = <number><unknown>this._textSize;
        let labeler = this.Labeler;

        if (this.Labels != null) {
            labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            this._minStep = 1;
        }

        let axisTick = LiveChartsCore.Extensions.GetTick(this, (chart.DrawMarginSize).Clone());
        let s = axisTick.Value;

        let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
        let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;

        if (s < this._minStep) s = this._minStep;
        if (this._forceStepToMin) s = this._minStep;

        let start = Math.trunc(min / s) * s;

        let w = 0;
        let h = 0;
        let r = <number><unknown>this.LabelsRotation;

        for (let i = start; i <= max; i += s) {
            // var textGeometry = new TTextGeometry
            // {
            //     Text = TryGetLabelOrLogError(labeler, i),
            //     TextSize = ts,
            //     RotateTransform = r,
            //     Padding = _padding
            // };
            let textGeometry = this._textGeometryFactory();
            textGeometry.Text = this.TryGetLabelOrLogError(labeler, i);
            textGeometry.TextSize = ts;
            textGeometry.RotateTransform = r;
            textGeometry.Padding = this._padding;

            let m = textGeometry.Measure(this.LabelsPaint);
            if (m.Width > w) w = m.Width;
            if (m.Height > h) h = m.Height;

        }

        return new LiveChartsCore.LvcSize(w, h);
    }

    Initialize(orientation: LiveChartsCore.AxisOrientation) {
        this._orientation = orientation;
        this._dataBounds = new LiveChartsCore.Bounds();
        this._visibleDataBounds = new LiveChartsCore.Bounds();
        this._animatableBounds ??= new LiveChartsCore.AnimatableAxisBounds();
        this.Initialized.Invoke(this);
    }

    public Delete(chart: LiveChartsCore.Chart<TDrawingContext>) {
        for (const paint of this.GetPaintTasks()) {
            if (paint == null) continue;

            chart.Canvas.RemovePaintTask(paint);
            paint.ClearGeometriesFromPaintTask(chart.Canvas);
        }
        this.activeSeparators.Remove(chart);
    }

    public RemoveFromUI(chart: LiveChartsCore.Chart<TDrawingContext>) {
        super.RemoveFromUI(chart);
        this._animatableBounds = null!;
        this.activeSeparators.Remove(chart);
    }

    protected OnPaintChanged(propertyName: Nullable<string>) {
        super.OnPaintChanged(propertyName);
        this.OnPropertyChanged(propertyName);
    }

    public GetPaintTasks(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>[] {
        return [this._separatorsPaint, this._labelsPaint, this._namePaint, this._zeroPaint, this._ticksPaint, this._subticksPaint, this._subseparatorsPaint];
    }

    private GetPossibleMaxLabelSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize {
        if (this.LabelsPaint == null) return new LiveChartsCore.LvcSize();

        let labeler = this.Labeler;

        if (this.Labels != null) {
            labeler = LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels).Function.bind(LiveChartsCore.Labelers.BuildNamedLabeler(this.Labels));
            this._minStep = 1;
        }

        let axisTick = LiveChartsCore.Extensions.GetTick(this, (chart.DrawMarginSize).Clone());
        let s = axisTick.Value;

        let max = this.MaxLimit == null ? this._visibleDataBounds.Max : this.MaxLimit;
        let min = this.MinLimit == null ? this._visibleDataBounds.Min : this.MinLimit;

        if (s == 0) s = 1;
        if (s < this._minStep) s = this._minStep;
        if (this._forceStepToMin) s = this._minStep;

        let maxLabelSize = new LiveChartsCore.LvcSize();

        if (max - min == 0) return maxLabelSize;

        for (let i = min; i <= max; i += s) {
            // var textGeometry = new TTextGeometry
            // {
            //     Text = labeler(i),
            //     TextSize = (float)_textSize,
            //     RotateTransform = (float)LabelsRotation,
            //     Padding = _padding
            // };
            let textGeometry = this._textGeometryFactory();
            textGeometry.Text = labeler(i);
            textGeometry.TextSize = <number><unknown>this._textSize;
            textGeometry.RotateTransform = <number><unknown>this.LabelsRotation;
            textGeometry.Padding = this._padding;

            let m = textGeometry.Measure(this.LabelsPaint);

            maxLabelSize = new LiveChartsCore.LvcSize(maxLabelSize.Width > m.Width ? maxLabelSize.Width : m.Width,
                maxLabelSize.Height > m.Height ? maxLabelSize.Height : m.Height);

        }

        return maxLabelSize;
    }

    private DrawName(cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>,
                     size: number,
                     lxi: number,
                     lxj: number,
                     lyi: number,
                     lyj: number) {
        let isNew = false;

        if (this._nameGeometry == null) {
            // _nameGeometry = new TTextGeometry
            // {
            //     TextSize = size,
            //     HorizontalAlign = Align.Middle,
            //     VerticalAlign = Align.Middle
            // };
            this._nameGeometry = this._textGeometryFactory();
            this._nameGeometry.TextSize = size;
            this._nameGeometry.HorizontalAlign = LiveChartsCore.Align.Middle;
            this._nameGeometry.VerticalAlign = LiveChartsCore.Align.Middle;
            LiveChartsCore.Extensions.TransitionateProperties(
                this._nameGeometry
                , "_nameGeometry.X",
                "_nameGeometry.Y")
                .WithAnimationBuilder(animation =>
                    animation
                        .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                        .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));

            isNew = true;
        }

        this._nameGeometry.Padding = this.NamePadding;
        this._nameGeometry.Text = this.Name ?? '';
        this._nameGeometry.TextSize = <number><unknown>this._nameTextSize;

        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            if (this.InLineNamePlacement) {
                this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
                this._nameGeometry.Y = this._nameDesiredSize.Y + this._nameDesiredSize.Height * 0.5;
            } else {
                this._nameGeometry.X = (lxi + lxj) * 0.5;
                this._nameGeometry.Y = this._nameDesiredSize.Y + this._nameDesiredSize.Height * 0.5;
            }
        } else {
            if (this.InLineNamePlacement) {
                this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
                this._nameGeometry.Y = this._nameDesiredSize.Height * 0.5;
            } else {
                this._nameGeometry.RotateTransform = -90;
                this._nameGeometry.X = this._nameDesiredSize.X + this._nameDesiredSize.Width * 0.5;
                this._nameGeometry.Y = (lyi + lyj) * 0.5;
            }
        }

        if (isNew) this._nameGeometry.CompleteTransition(null);
    }

    private InitializeSeparator(visualSeparator: LiveChartsCore.AxisVisualSeprator<TDrawingContext>, cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>, separatorGeometry: Nullable<TLineGeometry> = null) {
        let lineGeometry: TLineGeometry;

        if (separatorGeometry != null) {
            lineGeometry = separatorGeometry;
        } else {
            lineGeometry = this._lineGeometryFactory(); //new TLineGeometry();
            visualSeparator.Separator = lineGeometry;
        }

        visualSeparator.Separator = lineGeometry;
        this.InitializeLine(lineGeometry, cartesianChart);
    }

    private InitializeSubseparators(visualSeparator: LiveChartsCore.AxisVisualSeprator<TDrawingContext>, cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>) {
        visualSeparator.Subseparators = new Array<TLineGeometry>(this._subSections);

        for (let j = 0; j < this._subSections; j++) {
            let subSeparator = this._lineGeometryFactory();//new TLineGeometry();
            visualSeparator.Subseparators[j] = subSeparator;
            this.InitializeTick(visualSeparator, cartesianChart, subSeparator);
        }
    }

    private InitializeLine(lineGeometry: LiveChartsCore.ILineGeometry<TDrawingContext>, cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>) {
        LiveChartsCore.Extensions.TransitionateProperties(
            lineGeometry
            , "lineGeometry.X", "lineGeometry.X1",
            "lineGeometry.Y", "lineGeometry.Y1",
            "lineGeometry.Opacity")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
    }

    private InitializeTick(visualSeparator: LiveChartsCore.AxisVisualSeprator<TDrawingContext>, cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>, subTickGeometry: Nullable<TLineGeometry> = null) {
        let tickGeometry: TLineGeometry;

        if (subTickGeometry != null) {
            tickGeometry = subTickGeometry;
        } else {
            tickGeometry = this._lineGeometryFactory(); //new TLineGeometry();
            visualSeparator.Tick = tickGeometry;
        }
        LiveChartsCore.Extensions.TransitionateProperties(
            tickGeometry
            , "tickGeometry.X", "tickGeometry.X1",
            "tickGeometry.Y", "tickGeometry.Y1",
            "tickGeometry.Opacity")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
    }

    private InitializeSubticks(visualSeparator: LiveChartsCore.AxisVisualSeprator<TDrawingContext>, cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>) {
        visualSeparator.Subticks = new Array<TLineGeometry>(this._subSections);

        for (let j = 0; j < this._subSections; j++) {
            let subTick = this._lineGeometryFactory(); //new TLineGeometry();
            visualSeparator.Subticks[j] = subTick;
            this.InitializeTick(visualSeparator, cartesianChart, subTick);
        }
    }

    private IntializeLabel(visualSeparator: LiveChartsCore.AxisVisualSeprator<TDrawingContext>,
                           cartesianChart: LiveChartsCore.CartesianChart<TDrawingContext>,
                           size: number,
                           hasRotation: boolean,
                           r: number) {
        // var textGeometry = new TTextGeometry { TextSize = size };
        let textGeometry = this._textGeometryFactory();
        textGeometry.TextSize = size;

        visualSeparator.Label = textGeometry;
        if (hasRotation) textGeometry.RotateTransform = r;
        LiveChartsCore.Extensions.TransitionateProperties(
            textGeometry
            , "textGeometry.X",
            "textGeometry.Y",
            "textGeometry.Opacity")
            .WithAnimationBuilder(animation =>
                animation
                    .WithDuration(this.AnimationsSpeed ?? cartesianChart.AnimationsSpeed)
                    .WithEasingFunction(this.EasingFunction ?? cartesianChart.EasingFunction));
    }

    private UpdateSeparator(line: LiveChartsCore.ILineGeometry<TDrawingContext>,
                            x: number,
                            y: number,
                            lxi: number,
                            lxj: number,
                            lyi: number,
                            lyj: number,
                            mode: UpdateMode) {
        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            line.X = x;
            line.X1 = x;
            line.Y = lyi;
            line.Y1 = lyj;
        } else {
            line.X = lxi;
            line.X1 = lxj;
            line.Y = y;
            line.Y1 = y;
        }

        this.SetUpdateMode(line, mode);
    }

    private UpdateTick(tick: LiveChartsCore.ILineGeometry<TDrawingContext>, length: number, x: number, y: number, mode: UpdateMode) {
        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            let lyi = y + this._size.Height * 0.5;
            let lyj = y - this._size.Height * 0.5;
            tick.X = x;
            tick.X1 = x;
            tick.Y = this._position == LiveChartsCore.AxisPosition.Start ? lyj : lyi - length;
            tick.Y1 = this._position == LiveChartsCore.AxisPosition.Start ? lyj + length : lyi;
        } else {
            let lxi = x + this._size.Width * 0.5;
            let lxj = x - this._size.Width * 0.5;
            tick.X = this._position == LiveChartsCore.AxisPosition.Start ? lxi : lxj + length;
            tick.X1 = this._position == LiveChartsCore.AxisPosition.Start ? lxi - length : lxj;
            tick.Y = y;
            tick.Y1 = y;
        }

        this.SetUpdateMode(tick, mode);
    }

    private UpdateSubseparators(subseparators: LiveChartsCore.ILineGeometry<TDrawingContext>[], scale: LiveChartsCore.Scaler, s: number, x: number, y: number, lxi: number, lxj: number, lyi: number, lyj: number, mode: UpdateMode) {
        for (let j = 0; j < subseparators.length; j++) {
            let subseparator = subseparators[j];
            let kl = (j + 1) / <number><unknown>(this._subSections + 1);

            let xs: number = 0;
            let ys: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                xs = scale.MeasureInPixels(s * kl);
            } else {
                ys = scale.MeasureInPixels(s * kl);
            }

            this.UpdateSeparator(subseparator, x + xs, y + ys, lxi, lxj, lyi, lyj, mode);
        }
    }

    private UpdateSubticks(subticks: LiveChartsCore.ILineGeometry<TDrawingContext>[], scale: LiveChartsCore.Scaler, s: number, x: number, y: number, mode: UpdateMode) {
        for (let j = 0; j < subticks.length; j++) {
            let subtick = subticks[j];

            let k = 0.5;
            let kl = (j + 1) / <number><unknown>(this._subSections + 1);
            if (Math.abs(kl - 0.5) < 0.01) k += 0.25;

            let xs: number = 0;
            let ys: number = 0;
            if (this._orientation == LiveChartsCore.AxisOrientation.X) {
                xs = scale.MeasureInPixels(s * kl);
            } else {
                ys = scale.MeasureInPixels(s * kl);
            }

            this.UpdateTick(subtick, this._tickLength * k, x + xs, y + ys, mode);
        }
    }

    private UpdateLabel(label: LiveChartsCore.ILabelGeometry<TDrawingContext>,
                        x: number,
                        y: number,
                        text: string,
                        hasRotation: boolean,
                        r: number,
                        mode: UpdateMode) {
        let actualRotatation = r;
        let toRadians: number = Math.PI / 180;

        if (this._orientation == LiveChartsCore.AxisOrientation.Y) {
            actualRotatation %= 180;
            if (actualRotatation < 0) actualRotatation += 360;
            if (actualRotatation > 90 && actualRotatation < 180) actualRotatation += 180;
            if (actualRotatation > 180 && actualRotatation < 270) actualRotatation += 180;

            let actualAlignment = this._labelsAlignment == null
                ? (this._position == LiveChartsCore.AxisPosition.Start ? LiveChartsCore.Align.End : LiveChartsCore.Align.Start)
                : this._labelsAlignment;

            if (actualAlignment == LiveChartsCore.Align.Start) {
                if (hasRotation && this._labelsPaint != null) {
                    // var notRotatedSize =
                    //     new TTextGeometry { TextSize = (float)_textSize, Padding = _padding, Text = text }
                    //     .Measure(_labelsPaint);
                    let textGeometry = this._textGeometryFactory();
                    textGeometry.Text = text;
                    textGeometry.TextSize = <number><unknown>this._textSize;
                    textGeometry.Padding = this._padding;
                    let notRotatedSize = textGeometry.Measure(this._labelsPaint);

                    let rhx = Math.cos((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
                    x += <number><unknown>Math.abs(rhx * 0.5);
                }

                x -= this._labelsDesiredSize.Width * 0.5;
                label.HorizontalAlign = LiveChartsCore.Align.Start;
            } else {
                if (hasRotation && this._labelsPaint != null) {
                    // var notRotatedSize =
                    //     new TTextGeometry { TextSize = (float)_textSize, Padding = _padding, Text = text }
                    //     .Measure(_labelsPaint);
                    let textGeometry = this._textGeometryFactory();
                    textGeometry.Text = text;
                    textGeometry.TextSize = <number><unknown>this._textSize;
                    textGeometry.Padding = this._padding;
                    let notRotatedSize = textGeometry.Measure(this._labelsPaint);

                    let rhx = Math.cos((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
                    x -= <number><unknown>Math.abs(rhx * 0.5);
                }

                x += this._labelsDesiredSize.Width * 0.5;
                label.HorizontalAlign = LiveChartsCore.Align.End;
            }
        }

        if (this._orientation == LiveChartsCore.AxisOrientation.X) {
            actualRotatation %= 180;
            if (actualRotatation < 0) actualRotatation += 180;
            if (actualRotatation >= 90) actualRotatation -= 180;

            let actualAlignment = this._labelsAlignment == null
                ? (this._position == LiveChartsCore.AxisPosition.Start ? LiveChartsCore.Align.Start : LiveChartsCore.Align.End)
                : this._labelsAlignment;

            if (actualAlignment == LiveChartsCore.Align.Start) {
                if (hasRotation && this._labelsPaint != null) {
                    // var notRotatedSize =
                    //     new TTextGeometry { TextSize = (float)_textSize, Padding = _padding, Text = text }
                    //     .Measure(_labelsPaint);
                    let textGeometry = this._textGeometryFactory();
                    textGeometry.Text = text;
                    textGeometry.TextSize = <number><unknown>this._textSize;
                    textGeometry.Padding = this._padding;
                    let notRotatedSize = textGeometry.Measure(this._labelsPaint);

                    let rhx = Math.sin((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
                    y += <number><unknown>Math.abs(rhx * 0.5);
                }

                if (hasRotation) {
                    y -= this._labelsDesiredSize.Height * 0.5;
                    label.HorizontalAlign = actualRotatation < 0
                        ? LiveChartsCore.Align.End
                        : LiveChartsCore.Align.Start;
                } else {
                    label.HorizontalAlign = LiveChartsCore.Align.Middle;
                }
            } else {
                if (hasRotation && this._labelsPaint != null) {
                    // var notRotatedSize =
                    //     new TTextGeometry { TextSize = (float)_textSize, Padding = _padding, Text = text }
                    //     .Measure(_labelsPaint);
                    let textGeometry = this._textGeometryFactory();
                    textGeometry.Text = text;
                    textGeometry.TextSize = <number><unknown>this._textSize;
                    textGeometry.Padding = this._padding;
                    let notRotatedSize = textGeometry.Measure(this._labelsPaint);

                    let rhx = Math.sin((90 - actualRotatation) * toRadians) * notRotatedSize.Height;
                    y -= <number><unknown>Math.abs(rhx * 0.5);
                }

                if (hasRotation) {
                    y += this._labelsDesiredSize.Height * 0.5;
                    label.HorizontalAlign = actualRotatation < 0
                        ? LiveChartsCore.Align.Start
                        : LiveChartsCore.Align.End;
                } else {
                    label.HorizontalAlign = LiveChartsCore.Align.Middle;
                }
            }
        }

        label.Text = text;
        label.Padding = this._padding;
        label.X = x;
        label.Y = y;

        if (hasRotation) label.RotateTransform = actualRotatation;

        this.SetUpdateMode(label, mode);
    }

    private SetUpdateMode(geometry: LiveChartsCore.IGeometry<TDrawingContext>, mode: UpdateMode) {
        switch (mode) {
            case UpdateMode.UpdateAndComplete:
                if (this._animatableBounds.HasPreviousState) geometry.Opacity = 0;
                geometry.CompleteTransition(null);
                break;
            case UpdateMode.UpdateAndRemove:
                geometry.Opacity = 0;
                geometry.RemoveOnCompleted = true;
                break;
            case UpdateMode.Update:
            default:
                geometry.Opacity = 1;
                break;
        }
    }

    private TryGetLabelOrLogError(labeler: System.Func2<number, string>, value: number): string {
        try {
            return labeler(value);
        } catch (e: any) {
            return '';
        }
    }

    // private enum UpdateMode
    // {
    //     Update,
    //     UpdateAndComplete,
    //     UpdateAndRemove
    // }
}

enum UpdateMode {
    Update,
    UpdateAndComplete,
    UpdateAndRemove
}
