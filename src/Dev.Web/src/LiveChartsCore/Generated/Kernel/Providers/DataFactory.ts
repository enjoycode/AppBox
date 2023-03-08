import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class DataFactory<TModel, TDrawingContext extends LiveChartsCore.DrawingContext> {

    private _isTModelChartEntity: boolean = false;
    private readonly _chartRefEntityMap: System.ObjectMap<System.ObjectMap<LiveChartsCore.MappedChartEntity>> = new System.ObjectMap();
    private _series: Nullable<LiveChartsCore.ISeries>;

    private PreviousKnownBounds: LiveChartsCore.DimensionalBounds = new LiveChartsCore.DimensionalBounds(true);

    public constructor() {
        let bounds = new LiveChartsCore.DimensionalBounds(true);
        this.PreviousKnownBounds = bounds;

    }

    public Fetch(series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart): System.IEnumerable<LiveChartsCore.ChartPoint> {
        const _$generator = function* (this: any, series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart) {
            if (series.Values == null) return;
            this._series = series;

            for (const value of this.GetEntities(series, chart)) {
                if (value == null) {
                    yield LiveChartsCore.ChartPoint.Empty;
                    continue;
                }

                yield value.ChartPoints?.get(chart.View) ?? LiveChartsCore.ChartPoint.Empty;
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(series, chart));
    }

    public DisposePoint(point: LiveChartsCore.ChartPoint) {
        if (this._isTModelChartEntity) return;

        let canvas = <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>point.Context.Chart.CoreChart.Canvas;

        let d = this._chartRefEntityMap.get(canvas.Sync);
        let map = d;
        if (map == null) return;
        let src = <Nullable<TModel>><unknown>point.Context.DataSource;
        if (src == null) return;
        map.delete(src);
    }

    public Dispose(chart: LiveChartsCore.IChart) {
        this._series = null;
        if (this._isTModelChartEntity) return;

        let canvas = <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>chart.Canvas;
        this._chartRefEntityMap.delete(canvas.Sync);
    }

    public GetCartesianBounds(chart: LiveChartsCore.Chart<TDrawingContext>,
                              series: LiveChartsCore.IChartSeries<TDrawingContext>,
                              plane1: LiveChartsCore.IPlane,
                              plane2: LiveChartsCore.IPlane): LiveChartsCore.SeriesBounds {
        let stack = chart.SeriesContext.GetStackPosition(series, series.GetStackGroup());

        let xMin = plane1.MinLimit ?? Number.MIN_VALUE;
        let xMax = plane1.MaxLimit ?? Number.MAX_VALUE;
        let yMin = plane2.MinLimit ?? Number.MIN_VALUE;
        let yMax = plane2.MaxLimit ?? Number.MAX_VALUE;

        let hasData = false;

        let bounds = new LiveChartsCore.DimensionalBounds();

        let previous: Nullable<LiveChartsCore.ChartPoint> = null;

        for (const point of series.Fetch(chart)) {
            if (point.IsEmpty) continue;

            let primary = point.PrimaryValue;
            let secondary = point.SecondaryValue;
            let tertiary = point.TertiaryValue;

            if (stack != null) primary = stack.StackPoint(point);

            bounds.PrimaryBounds.AppendValue(primary);
            bounds.SecondaryBounds.AppendValue(secondary);
            bounds.TertiaryBounds.AppendValue(tertiary);

            if (primary >= yMin && primary <= yMax && secondary >= xMin && secondary <= xMax) {
                bounds.VisiblePrimaryBounds.AppendValue(primary);
                bounds.VisibleSecondaryBounds.AppendValue(secondary);
                bounds.VisibleTertiaryBounds.AppendValue(tertiary);
            }

            if (previous != null) {
                let dx = Math.abs(previous.SecondaryValue - point.SecondaryValue);
                let dy = Math.abs(previous.PrimaryValue - point.PrimaryValue);
                if (dx < bounds.SecondaryBounds.MinDelta) bounds.SecondaryBounds.MinDelta = dx;
                if (dy < bounds.PrimaryBounds.MinDelta) bounds.PrimaryBounds.MinDelta = dy;
            }

            previous = point;
            hasData = true;
        }

        return !hasData
            ? new LiveChartsCore.SeriesBounds(this.PreviousKnownBounds, true)
            : new LiveChartsCore.SeriesBounds(this.PreviousKnownBounds = bounds, false);
    }

    public GetFinancialBounds(chart: LiveChartsCore.CartesianChart<TDrawingContext>,
                              series: LiveChartsCore.IChartSeries<TDrawingContext>,
                              x: LiveChartsCore.ICartesianAxis,
                              y: LiveChartsCore.ICartesianAxis): LiveChartsCore.SeriesBounds {
        let xMin = x.MinLimit ?? Number.MIN_VALUE;
        let xMax = x.MaxLimit ?? Number.MAX_VALUE;
        let yMin = y.MinLimit ?? Number.MIN_VALUE;
        let yMax = y.MaxLimit ?? Number.MAX_VALUE;

        let hasData = false;

        let bounds = new LiveChartsCore.DimensionalBounds();
        let previous: Nullable<LiveChartsCore.ChartPoint> = null;
        for (const point of series.Fetch(chart)) {
            if (point.IsEmpty) continue;

            let primaryMax = point.PrimaryValue;
            let primaryMin = point.QuinaryValue;
            let secondary = point.SecondaryValue;
            let tertiary = point.TertiaryValue;

            bounds.PrimaryBounds.AppendValue(primaryMax);
            bounds.PrimaryBounds.AppendValue(primaryMin);
            bounds.SecondaryBounds.AppendValue(secondary);
            bounds.TertiaryBounds.AppendValue(tertiary);

            if (primaryMax >= yMin && primaryMin <= yMax && secondary >= xMin && secondary <= xMax) {
                bounds.VisiblePrimaryBounds.AppendValue(primaryMax);
                bounds.VisiblePrimaryBounds.AppendValue(primaryMin);
                bounds.VisibleSecondaryBounds.AppendValue(secondary);
                bounds.VisibleTertiaryBounds.AppendValue(tertiary);
            }

            if (previous != null) {
                let dx = Math.abs(previous.SecondaryValue - point.SecondaryValue);
                let dy = Math.abs(previous.PrimaryValue - point.PrimaryValue);
                if (dx < bounds.SecondaryBounds.MinDelta) bounds.SecondaryBounds.MinDelta = dx;
                if (dy < bounds.PrimaryBounds.MinDelta) bounds.PrimaryBounds.MinDelta = dy;
            }

            previous = point;
            hasData = true;
        }

        return !hasData
            ? new LiveChartsCore.SeriesBounds(this.PreviousKnownBounds, true)
            : new LiveChartsCore.SeriesBounds(this.PreviousKnownBounds = bounds, false);
    }

    public GetPieBounds(chart: LiveChartsCore.PieChart<TDrawingContext>, series: LiveChartsCore.IPieSeries<TDrawingContext>): LiveChartsCore.SeriesBounds {
        let stack = chart.SeriesContext.GetStackPosition(series, series.GetStackGroup());
        if (stack == null) throw new System.Exception("Unexpected null stacker");

        let bounds = new LiveChartsCore.DimensionalBounds();
        let hasData = false;

        for (const point of series.Fetch(chart)) {
            if (point.IsEmpty) continue;
            stack.StackPoint(point);
            bounds.PrimaryBounds.AppendValue(point.PrimaryValue);
            bounds.SecondaryBounds.AppendValue(point.SecondaryValue);
            bounds.TertiaryBounds.AppendValue(series.Pushout > series.HoverPushout ? series.Pushout : series.HoverPushout);
            hasData = true;
        }

        if (!hasData) {
            bounds.PrimaryBounds.AppendValue(0);
            bounds.SecondaryBounds.AppendValue(0);
            bounds.TertiaryBounds.AppendValue(0);
        }

        return new LiveChartsCore.SeriesBounds(bounds, false);
    }


    public RestartVisuals() {
        throw new System.NotImplementedException("DataFactory.RestartVisuals");
    }

    private GetEntities(series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart): System.IEnumerable<Nullable<LiveChartsCore.IChartEntity>> {
        this._isTModelChartEntity = LiveChartsCore.IsInterfaceOfIChartEntity(series.Values!.First(t => t != null));
        return this._isTModelChartEntity
            ? this.EnumerateChartEntities(series, chart)
            : this.EnumerateByRefEntities(series, chart);
    }

    private EnumerateChartEntities(series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart): System.IEnumerable<LiveChartsCore.IChartEntity> {
        const _$generator = function* (this: any, series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart) {
            if (series.Values == null) return;
            let entities = <System.IEnumerable<LiveChartsCore.IChartEntity>><unknown>series.Values;
            let index = 0;

            for (const entity of entities) {
                if (entity == null) {
                    index++;
                    yield new LiveChartsCore.MappedChartEntity();
                    continue;
                }

                entity.ChartPoints ??= new System.ObjectMap<LiveChartsCore.ChartPoint>();
                let point = entity.ChartPoints.get(chart.View);
                if (point == null) {
                    point = new LiveChartsCore.ChartPoint(chart.View, series, entity);
                    entity.ChartPoints.set(chart.View, point);
                }


                point.Context.DataSource = entity;
                entity.EntityIndex = index++;

                yield entity;
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(series, chart));
    }


    private EnumerateByRefEntities(series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart): System.IEnumerable<Nullable<LiveChartsCore.IChartEntity>> {
        const _$generator = function* (this: any, series: LiveChartsCore.ISeries1<TModel>, chart: LiveChartsCore.IChart) {
            if (series.Values == null) return;

            let canvas = <LiveChartsCore.MotionCanvas<TDrawingContext>><unknown>chart.Canvas;
            let mapper = series.Mapping;
            if (mapper == null) throw new System.Exception("series has no mapper");
            let index = 0;

            let d = this._chartRefEntityMap.get(canvas.Sync);
            if (d == null) {
                d = new System.ObjectMap<LiveChartsCore.MappedChartEntity>();
                this._chartRefEntityMap.set(canvas.Sync, d);
            }
            let IndexEntityMap = d;

            for (const item of series.Values) {
                if (item == null) {
                    yield new LiveChartsCore.MappedChartEntity();
                    index++;
                    continue;
                }

                let entity = IndexEntityMap.get(item);
                if (entity == null) {
                    entity = new LiveChartsCore.MappedChartEntity().Init({ChartPoints: new System.ObjectMap<LiveChartsCore.ChartPoint>()});
                    IndexEntityMap.set(item, entity);
                }

                let point = entity.ChartPoints.get(chart.View);
                if (point == null) {
                    point = new LiveChartsCore.ChartPoint(chart.View, series, entity);
                    entity.ChartPoints.set(chart.View, point);
                }

                point.Context.DataSource = item;
                entity.EntityIndex = index++;

                mapper(item, point);
                entity.UpdateCoordinate(point);

                yield entity;
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(series, chart));
    }
}
