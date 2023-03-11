import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class BarSeries<TModel, TVisual extends object & LiveChartsCore.ISizedVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.StrokeAndFillCartesianSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.IBarSeries<TDrawingContext> {
    private _pading: number = 5;
    private _maxBarWidth: number = 50;
    private _ignoresBarPosition: boolean = false;
    private _rx: number = 0;
    private _ry: number = 0;

    protected readonly _visualFactory: System.Func1<TVisual>;
    protected readonly _labelFactory: System.Func1<TLabel>;

    protected constructor(properties: LiveChartsCore.SeriesProperties, visualFactory: System.Func1<TVisual>, labelFactory: System.Func1<TLabel>) {
        super(properties);
        this._visualFactory = visualFactory;
        this._labelFactory = labelFactory;
    }

    public get Padding(): number {
        return this._pading;
    }

    public set Padding(value: number) {
        this.SetProperty(new System.Ref(() => this._pading, $v => this._pading = $v), value, "Padding");
    }

    public get MaxBarWidth(): number {
        return this._maxBarWidth;
    }

    public set MaxBarWidth(value: number) {
        this.SetProperty(new System.Ref(() => this._maxBarWidth, $v => this._maxBarWidth = $v), value, "MaxBarWidth");
    }

    public get IgnoresBarPosition(): boolean {
        return this._ignoresBarPosition;
    }

    public set IgnoresBarPosition(value: boolean) {
        this.SetProperty(new System.Ref(() => this._ignoresBarPosition, $v => this._ignoresBarPosition = $v), value, "IgnoresBarPosition");
    }

    public get Rx(): number {
        return this._rx;
    }

    public set Rx(value: number) {
        this.SetProperty(new System.Ref(() => this._rx, $v => this._rx = $v), value, "Rx");
    }

    public get Ry(): number {
        return this._ry;
    }

    public set Ry(value: number) {
        this.SetProperty(new System.Ref(() => this._ry, $v => this._ry = $v), value, "Ry");
    }

    GetMiniatresSketch(): LiveChartsCore.Sketch<TDrawingContext> {
        let schedules = new System.List<LiveChartsCore.PaintSchedule<TDrawingContext>>();

        if (this.Fill != null) schedules.Add(this.BuildMiniatureSchedule(this.Fill, this._visualFactory()));
        if (this.Stroke != null) schedules.Add(this.BuildMiniatureSchedule(this.Stroke, this._visualFactory()));

        return new LiveChartsCore.Sketch<TDrawingContext>().Init(
            {
                Height: this.MiniatureShapeSize,
                Width: this.MiniatureShapeSize,
                PaintSchedules: schedules
            });
    }

    protected static MeasureHelper = class<T extends LiveChartsCore.DrawingContext> {
        public constructor(
            scaler: LiveChartsCore.Scaler,
            cartesianChart: LiveChartsCore.CartesianChart<T>,
            barSeries: LiveChartsCore.IBarSeries<T>,
            axis: LiveChartsCore.ICartesianAxis,
            p: number,
            minP: number,
            maxP: number,
            isStacked: boolean) {
            this.p = p;
            if (p < minP) this.p = minP;
            if (p > maxP) this.p = maxP;

            this.uw = scaler.MeasureInPixels(axis.UnitWidth);
            this.actualUw = this.uw;

            let gp = <number><unknown>barSeries.Padding;

            if (this.uw - gp < 1) gp -= this.uw - gp;

            this.uw -= gp;
            this.uwm = 0.5 * this.uw;

            let pos: number = 0;
            let count: number = 0;

            if (isStacked) {
                pos = cartesianChart.SeriesContext.GetStackedColumnPostion(barSeries);
                count = cartesianChart.SeriesContext.GetStackedColumnSeriesCount();
            } else {
                pos = cartesianChart.SeriesContext.GetColumnPostion(barSeries);
                count = cartesianChart.SeriesContext.GetColumnSeriesCount();
            }

            this.cp = 0;

            let padding = <number><unknown>barSeries.Padding;

            this.uw /= count;
            let mw = <number><unknown>barSeries.MaxBarWidth;
            if (this.uw > mw) this.uw = mw;
            this.uwm = 0.5 * this.uw;
            this.cp = barSeries.IgnoresBarPosition ? 0 : (pos - count / 2) * this.uw + this.uwm;

            // apply the pading
            this.uw -= padding;
            this.cp += padding * 0.5;

            if (this.uw < 1) {
                this.uw = 1;
                this.uwm = 0.5;
            }
        }

        public uw: number = 0;
        public uwm: number = 0;
        public cp: number = 0;
        public p: number = 0;
        public actualUw: number = 0;
    }
}
