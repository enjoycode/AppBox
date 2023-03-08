import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class CartesianSeries<TModel, TVisual extends object & LiveChartsCore.IVisualChartPoint<TDrawingContext>, TLabel extends object & LiveChartsCore.ILabelGeometry<TDrawingContext>, TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ChartSeries<TModel, TVisual, TLabel, TDrawingContext> implements LiveChartsCore.ICartesianSeries<TDrawingContext> {
    private _scalesXAt: number = 0;
    private _scalesYAt: number = 0;
    private _labelsPosition: LiveChartsCore.DataLabelsPosition = 0;
    private _labelsTranslate: Nullable<LiveChartsCore.LvcPoint> = null;

    protected constructor(properties: LiveChartsCore.SeriesProperties) {
        super(properties);
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

    public get DataLabelsPosition(): LiveChartsCore.DataLabelsPosition {
        return this._labelsPosition;
    }

    public set DataLabelsPosition(value: LiveChartsCore.DataLabelsPosition) {
        this.SetProperty(new System.Ref(() => this._labelsPosition, $v => this._labelsPosition = $v), value);
    }

    public get DataLabelsTranslate(): Nullable<LiveChartsCore.LvcPoint> {
        return this._labelsTranslate;
    }

    public set DataLabelsTranslate(value: Nullable<LiveChartsCore.LvcPoint>) {
        this.SetProperty(new System.Ref(() => this._labelsTranslate, $v => this._labelsTranslate = $v), (value)?.Clone());
    }

    public GetBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>, secondaryAxis: LiveChartsCore.ICartesianAxis, primaryAxis: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds {
        let rawBounds = this.DataFactory.GetCartesianBounds(chart, this, secondaryAxis, primaryAxis);
        if (rawBounds.HasData) return rawBounds;

        let rawBaseBounds = rawBounds.Bounds;

        let tickPrimary = LiveChartsCore.Extensions.GetTick(primaryAxis, (chart.ControlSize).Clone(), rawBaseBounds.VisiblePrimaryBounds);
        let tickSecondary = LiveChartsCore.Extensions.GetTick(secondaryAxis, (chart.ControlSize).Clone(), rawBaseBounds.VisibleSecondaryBounds);

        let ts = tickSecondary.Value * this.DataPadding.X;
        let tp = tickPrimary.Value * this.DataPadding.Y;


        if (rawBaseBounds.VisibleSecondaryBounds.Delta == 0) ts = secondaryAxis.UnitWidth * this.DataPadding.X;
        if (rawBaseBounds.VisiblePrimaryBounds.Delta == 0) tp = rawBaseBounds.VisiblePrimaryBounds.Max * 0.25;

        let rgs = this.GetRequestedGeometrySize();
        let rso = this.GetRequestedSecondaryOffset();
        let rpo = this.GetRequestedPrimaryOffset();

        let dimensionalBounds = new LiveChartsCore.DimensionalBounds().Init(
            {
                SecondaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.SecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.SecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
                        MinDelta: rawBaseBounds.SecondaryBounds.MinDelta,
                        PaddingMax: ts,
                        PaddingMin: ts,
                        RequestedGeometrySize: rgs
                    }),
                PrimaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.PrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.PrimaryBounds.Min - rpo * secondaryAxis.UnitWidth,
                        MinDelta: rawBaseBounds.PrimaryBounds.MinDelta,
                        PaddingMax: tp,
                        PaddingMin: tp,
                        RequestedGeometrySize: rgs
                    }),
                VisibleSecondaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.VisibleSecondaryBounds.Max + rso * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.VisibleSecondaryBounds.Min - rso * secondaryAxis.UnitWidth,
                    }),
                VisiblePrimaryBounds: new LiveChartsCore.Bounds().Init(
                    {
                        Max: rawBaseBounds.VisiblePrimaryBounds.Max + rpo * secondaryAxis.UnitWidth,
                        Min: rawBaseBounds.VisiblePrimaryBounds.Min - rpo * secondaryAxis.UnitWidth
                    }),
                TertiaryBounds: rawBaseBounds.TertiaryBounds,
                VisibleTertiaryBounds: rawBaseBounds.VisibleTertiaryBounds
            });

        if (this.GetIsInvertedBounds()) {
            let tempSb = dimensionalBounds.SecondaryBounds;
            let tempPb = dimensionalBounds.PrimaryBounds;
            let tempVsb = dimensionalBounds.VisibleSecondaryBounds;
            let tempVpb = dimensionalBounds.VisiblePrimaryBounds;

            dimensionalBounds.SecondaryBounds = tempPb;
            dimensionalBounds.PrimaryBounds = tempSb;
            dimensionalBounds.VisibleSecondaryBounds = tempVpb;
            dimensionalBounds.VisiblePrimaryBounds = tempVsb;
        }

        return new LiveChartsCore.SeriesBounds(dimensionalBounds, false);
    }

    protected GetRequestedGeometrySize(): number {
        return 0;
    }

    protected GetRequestedSecondaryOffset(): number {
        return 0;
    }

    protected GetRequestedPrimaryOffset(): number {
        return 0;
    }

    protected GetIsInvertedBounds(): boolean {
        return false;
    }

    public SoftDeleteOrDispose(chart: LiveChartsCore.IChartView) {
        let core = (<LiveChartsCore.ICartesianChartView<TDrawingContext>><unknown>chart).Core;

        let secondaryAxis = core.XAxes.length > this.ScalesXAt ? core.XAxes[this.ScalesXAt] : null;
        let primaryAxis = core.YAxes.length > this.ScalesYAt ? core.YAxes[this.ScalesYAt] : null;

        let secondaryScale = secondaryAxis == null ? LiveChartsCore.Scaler.MakeDefault()
            : LiveChartsCore.Scaler.Make((core.DrawMarginLocation).Clone(), (core.DrawMarginSize).Clone(), secondaryAxis);
        let primaryScale = primaryAxis == null ? LiveChartsCore.Scaler.MakeDefault()
            : LiveChartsCore.Scaler.Make((core.DrawMarginLocation).Clone(), (core.DrawMarginSize).Clone(), primaryAxis);

        let deleted = new System.List<LiveChartsCore.ChartPoint>();
        for (const point of this.everFetched) {
            if (point.Context.Chart != chart) continue;

            this.SoftDeleteOrDisposePoint(point, primaryScale, secondaryScale);
            deleted.Add(point);
        }

        for (const pt of this.GetPaintTasks()) {
            if (pt != null) core.Canvas.RemovePaintTask(pt);
        }

        for (const item of deleted) this.everFetched.Remove(item);

        this.OnVisibilityChanged();
    }

    public abstract SoftDeleteOrDisposePoint(point: LiveChartsCore.ChartPoint, primaryScale: LiveChartsCore.Scaler, secondaryScale: LiveChartsCore.Scaler): void;

    public GetLabelPosition(x: number,
                            y: number,
                            width: number,
                            height: number,
                            labelSize: LiveChartsCore.LvcSize,
                            position: LiveChartsCore.DataLabelsPosition,
                            seriesProperties: LiveChartsCore.SeriesProperties,
                            isGreaterThanPivot: boolean,
                            drawMarginLocation: LiveChartsCore.LvcPoint,
                            drawMarginSize: LiveChartsCore.LvcSize): LiveChartsCore.LvcPoint {
        let middleX = (x + x + width) * 0.5;
        let middleY = (y + y + height) * 0.5;

        return match(position)
            .with(LiveChartsCore.DataLabelsPosition.Middle
                , () => new LiveChartsCore.LvcPoint(middleX, middleY))
            .with(LiveChartsCore.DataLabelsPosition.Top
                , () => new LiveChartsCore.LvcPoint(middleX, y - labelSize.Height * 0.5))
            .with(LiveChartsCore.DataLabelsPosition.Bottom
                , () => new LiveChartsCore.LvcPoint(middleX, y + height + labelSize.Height * 0.5))
            .with(LiveChartsCore.DataLabelsPosition.Left
                , () => new LiveChartsCore.LvcPoint(x - labelSize.Width * 0.5, middleY))
            .with(LiveChartsCore.DataLabelsPosition.Right
                , () => new LiveChartsCore.LvcPoint(x + width + labelSize.Width * 0.5, middleY))
            .with(LiveChartsCore.DataLabelsPosition.End, () => (seriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation
                ? (isGreaterThanPivot
                    ? new LiveChartsCore.LvcPoint(x + width + labelSize.Width * 0.5, middleY)
                    : new LiveChartsCore.LvcPoint(x - labelSize.Width * 0.5, middleY))
                : (isGreaterThanPivot
                    ? new LiveChartsCore.LvcPoint(middleX, y - labelSize.Height * 0.5)
                    : new LiveChartsCore.LvcPoint(middleX, y + height + labelSize.Height * 0.5)))
            .with(LiveChartsCore.DataLabelsPosition.Start, () => (seriesProperties & LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation) == LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation
                ? (isGreaterThanPivot
                    ? new LiveChartsCore.LvcPoint(x - labelSize.Width * 0.5, middleY)
                    : new LiveChartsCore.LvcPoint(x + width + labelSize.Width * 0.5, middleY))
                : (isGreaterThanPivot
                    ? new LiveChartsCore.LvcPoint(middleX, y + height + labelSize.Height * 0.5)
                    : new LiveChartsCore.LvcPoint(middleX, y - labelSize.Height * 0.5)))
            .otherwise(() => {
                throw new System.Exception("Position not supported")
            });
    }
}
