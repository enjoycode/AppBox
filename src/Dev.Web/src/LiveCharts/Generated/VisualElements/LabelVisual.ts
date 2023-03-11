import * as System from '@/System'
import * as LiveCharts from '@/LiveCharts'
import * as LiveChartsCore from '@/LiveChartsCore'

export class LabelVisual extends LiveChartsCore.VisualElement<LiveCharts.SkiaDrawingContext> {
    public _labelGeometry: Nullable<LiveCharts.LabelGeometry>;
    public _paint: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>;
    public _isVirtual: boolean = false;
    public _text: string = '';
    public _textSize: number = 12;
    public _verticalAlignment: LiveChartsCore.Align = LiveChartsCore.Align.Middle;
    public _horizontalAlignment: LiveChartsCore.Align = LiveChartsCore.Align.Middle;
    public _backgroundColor: LiveChartsCore.LvcColor = LiveChartsCore.LvcColor.Empty.Clone();
    public _padding: LiveChartsCore.Padding = LiveChartsCore.Padding.All(0);
    public _rotation: number = 0;
    public _lineHeight: number = 1.75;
    public _translate: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint()).Clone();
    private _actualSize: LiveChartsCore.LvcSize = (new LiveChartsCore.LvcSize()).Clone();
    private _targetPosition: LiveChartsCore.LvcPoint = (new LiveChartsCore.LvcPoint()).Clone();

    public get Paint(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>> {
        return this._paint;
    }

    public set Paint(value: Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>) {
        this.SetPaintProperty(new System.Ref(() => this._paint, $v => this._paint = $v), value);
    }

    public get Text(): string {
        return this._text;
    }

    public set Text(value: string) {
        this._text = value;
        this.OnPropertyChanged("Text");
    }

    public get TextSize(): number {
        return this._textSize;
    }

    public set TextSize(value: number) {
        this._textSize = value;
        this.OnPropertyChanged("TextSize");
    }

    public get Rotation(): number {
        return this._rotation;
    }

    public set Rotation(value: number) {
        this._rotation = value;
        this.OnPropertyChanged("Rotation");
    }

    public get Translate(): LiveChartsCore.LvcPoint {
        return this._translate;
    }

    public set Translate(value: LiveChartsCore.LvcPoint) {
        this._translate = (value).Clone();
        this.OnPropertyChanged("Translate");
    }

    public get VerticalAlignment(): LiveChartsCore.Align {
        return this._verticalAlignment;
    }

    public set VerticalAlignment(value: LiveChartsCore.Align) {
        this._verticalAlignment = value;
        this.OnPropertyChanged("VerticalAlignment");
    }

    public get HorizontalAlignment(): LiveChartsCore.Align {
        return this._horizontalAlignment;
    }

    public set HorizontalAlignment(value: LiveChartsCore.Align) {
        this._horizontalAlignment = value;
        this.OnPropertyChanged("HorizontalAlignment");
    }

    public get BackgroundColor(): LiveChartsCore.LvcColor {
        return this._backgroundColor;
    }

    public set BackgroundColor(value: LiveChartsCore.LvcColor) {
        this._backgroundColor = (value).Clone();
        this.OnPropertyChanged("BackgroundColor");
    }

    public get Padding(): LiveChartsCore.Padding {
        return this._padding;
    }

    public set Padding(value: LiveChartsCore.Padding) {
        this._padding = value;
        this.OnPropertyChanged("Padding");
    }

    public get LineHeight(): number {
        return this._lineHeight;
    }

    public set LineHeight(value: number) {
        this._lineHeight = value;
        this.OnPropertyChanged("LineHeight");
    }

    GetPaintTasks(): Nullable<LiveChartsCore.IPaint<LiveCharts.SkiaDrawingContext>>[] {
        return [this._paint];
    }

    AlignToTopLeftCorner() {
        this.VerticalAlignment = LiveChartsCore.Align.Start;
        this.HorizontalAlignment = LiveChartsCore.Align.Start;
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

        this._targetPosition = (new LiveChartsCore.LvcPoint(<number><unknown>this.X + this._xc, <number><unknown>this.Y + this._yc)).Clone();
        this.Measure(chart, primaryScaler, secondaryScaler);

        if (this._labelGeometry == null) {
            let cp = this.GetPositionRelativeToParent();

            this._labelGeometry = new LiveCharts.LabelGeometry().Init(
                {
                    Text: this.Text,
                    TextSize: <number><unknown>this.TextSize,
                    X: cp.X,
                    Y: cp.Y,
                    RotateTransform: <number><unknown>this.Rotation,
                    TranslateTransform: (this.Translate).Clone(),
                    VerticalAlign: this.VerticalAlignment,
                    HorizontalAlign: this.HorizontalAlignment,
                    Background: (this.BackgroundColor).Clone(),
                    Padding: this.Padding
                });
            LiveChartsCore.Extensions.TransitionateProperties(this._labelGeometry
            )
                .WithAnimationFromChart(chart)
                .CompleteCurrentTransitions();
        }

        this._labelGeometry.Text = this.Text;
        this._labelGeometry.TextSize = <number><unknown>this.TextSize;
        this._labelGeometry.X = x + this._xc;
        this._labelGeometry.Y = y + this._yc;
        this._labelGeometry.RotateTransform = <number><unknown>this.Rotation;
        this._labelGeometry.TranslateTransform = (this.Translate).Clone();
        this._labelGeometry.VerticalAlign = this.VerticalAlignment;
        this._labelGeometry.HorizontalAlign = this.HorizontalAlignment;
        this._labelGeometry.Background = (this.BackgroundColor).Clone();
        this._labelGeometry.Padding = this.Padding;
        this._labelGeometry.LineHeight = this.LineHeight;

        let drawing = LiveCharts.DrawingFluentExtensions.Draw(chart.Canvas);
        if (this.Paint != null) drawing.SelectPaint(this.Paint).Draw(this._labelGeometry);
    }

    Measure(chart: LiveChartsCore.Chart<LiveCharts.SkiaDrawingContext>, primaryScaler: Nullable<LiveChartsCore.Scaler>, secondaryScaler: Nullable<LiveChartsCore.Scaler>): LiveChartsCore.LvcSize {
        let l = this._labelGeometry ?? new LiveCharts.LabelGeometry().Init(
            {
                Text: this.Text,
                TextSize: <number><unknown>this.TextSize,
                RotateTransform: <number><unknown>this.Rotation,
                TranslateTransform: (this.Translate).Clone(),
                VerticalAlign: this.VerticalAlignment,
                HorizontalAlign: this.HorizontalAlignment,
                Background: (this.BackgroundColor).Clone(),
                Padding: this.Padding,
            });

        return this._actualSize = (this._paint == null ? new LiveChartsCore.LvcSize()
            : l.Measure(this._paint)).Clone();
    }

    GetTargetSize(): LiveChartsCore.LvcSize {
        return this._actualSize;
    }

    GetTargetLocation(): LiveChartsCore.LvcPoint {
        let x = this._targetPosition.X;
        let y = this._targetPosition.Y;

        x += this.Translate.X;
        y += this.Translate.Y;

        let size = this.GetTargetSize();
        if (this.HorizontalAlignment == LiveChartsCore.Align.Middle) x -= size.Width * 0.5;
        if (this.HorizontalAlignment == LiveChartsCore.Align.End) x -= size.Width;

        if (this.VerticalAlignment == LiveChartsCore.Align.Middle) y -= size.Height * 0.5;
        if (this.VerticalAlignment == LiveChartsCore.Align.End) y -= size.Height;

        return new LiveChartsCore.LvcPoint(x, y);
    }
}
