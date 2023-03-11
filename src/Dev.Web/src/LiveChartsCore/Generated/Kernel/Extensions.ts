import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class Extensions {
    private static readonly Cf: number = 3;


    public static GetTooltipLocation<TDrawingContext extends LiveChartsCore.DrawingContext>(foundPoints: System.IEnumerable<LiveChartsCore.ChartPoint>,
                                                                                            tooltipSize: LiveChartsCore.LvcSize,
                                                                                            chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcPoint {
        let location: Nullable<LiveChartsCore.LvcPoint> = null;

        //前端esbuild暂不支持 (obj instanceof xxx || obj instanceof yyy)
        if (chart instanceof LiveChartsCore.CartesianChart<TDrawingContext>)
            location = Extensions._getCartesianTooltipLocation(foundPoints, chart.TooltipPosition, (tooltipSize).Clone(), (chart.DrawMarginSize).Clone());
        else if (chart instanceof LiveChartsCore.PolarChart<TDrawingContext>)
            location = Extensions._getCartesianTooltipLocation(foundPoints, chart.TooltipPosition, (tooltipSize).Clone(), (chart.DrawMarginSize).Clone());
        else if (chart instanceof LiveChartsCore.PieChart<TDrawingContext>)
            location = Extensions._getPieTooltipLocation(foundPoints, (tooltipSize).Clone());

        if (location == null) throw new System.Exception("location not supported");

        let chartSize = (chart.DrawMarginSize).Clone();

        let x = location.X;
        let y = location.Y;
        let w = chartSize.Width;
        let h = chartSize.Height;

        if (x + tooltipSize.Width > w) x = w - tooltipSize.Width;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (y + tooltipSize.Height > h) y = h - tooltipSize.Height;

        return new LiveChartsCore.LvcPoint(x, y);
    }

    private static _getCartesianTooltipLocation(foundPoints: System.IEnumerable<LiveChartsCore.ChartPoint>, position: LiveChartsCore.TooltipPosition, tooltipSize: LiveChartsCore.LvcSize, chartSize: LiveChartsCore.LvcSize): Nullable<LiveChartsCore.LvcPoint> {
        let count = 0;

        let placementContext = new LiveChartsCore.TooltipPlacementContext();

        for (const point of foundPoints) {
            if (point.Context.HoverArea == null) continue;
            point.Context.HoverArea.SuggestTooltipPlacement(placementContext);
            count++;
        }

        if (count == 0) return null;

        if (placementContext.MostBottom > chartSize.Height - tooltipSize.Height)
            placementContext.MostBottom = chartSize.Height - tooltipSize.Height;
        if (placementContext.MostTop < 0) placementContext.MostTop = 0;

        let avrgX = (placementContext.MostRight + placementContext.MostLeft) / 2 - tooltipSize.Width * 0.5;
        let avrgY = (placementContext.MostTop + placementContext.MostBottom) / 2 - tooltipSize.Height * 0.5;

        return match(position)
            .with(LiveChartsCore.TooltipPosition.Top, () => new LiveChartsCore.LvcPoint(avrgX, placementContext.MostTop - tooltipSize.Height))
            .with(LiveChartsCore.TooltipPosition.Bottom, () => new LiveChartsCore.LvcPoint(avrgX, placementContext.MostBottom))
            .with(LiveChartsCore.TooltipPosition.Left, () => new LiveChartsCore.LvcPoint(placementContext.MostLeft - tooltipSize.Width, avrgY))
            .with(LiveChartsCore.TooltipPosition.Right, () => new LiveChartsCore.LvcPoint(placementContext.MostRight, avrgY))
            .with(LiveChartsCore.TooltipPosition.Center, () => new LiveChartsCore.LvcPoint(avrgX, avrgY))
            .with(LiveChartsCore.TooltipPosition.Hidden, () => new LiveChartsCore.LvcPoint(0, 0))
            .otherwise(() => new LiveChartsCore.LvcPoint(0, 0));
    }

    private static _getPieTooltipLocation(foundPoints: System.IEnumerable<LiveChartsCore.ChartPoint>, tooltipSize: LiveChartsCore.LvcSize): Nullable<LiveChartsCore.LvcPoint> {
        let placementContext = new LiveChartsCore.TooltipPlacementContext();
        let found = false;

        for (const foundPoint of foundPoints) {
            if (foundPoint.Context.HoverArea == null) continue;
            foundPoint.Context.HoverArea.SuggestTooltipPlacement(placementContext);
            found = true;
            break; // we only care about the first one.
        }

        return found
            ? new LiveChartsCore.LvcPoint(placementContext.PieX - tooltipSize.Width * 0.5, placementContext.PieY - tooltipSize.Height * 0.5)
            : null;
    }

    public static GetTick(axis: LiveChartsCore.ICartesianAxis, controlSize: LiveChartsCore.LvcSize, bounds: Nullable<LiveChartsCore.Bounds> = null, maxLabelSize: Nullable<LiveChartsCore.LvcSize> = null): LiveChartsCore.AxisTick {
        bounds ??= axis.VisibleDataBounds;

        let w = (maxLabelSize?.Width ?? 0) * 0.60;
        if (w < 20 * Extensions.Cf) w = 20 * Extensions.Cf;

        let h = maxLabelSize?.Height ?? 0;
        if (h < 12 * Extensions.Cf) h = 12 * Extensions.Cf;

        let max = axis.MaxLimit == null ? bounds.Max : axis.MaxLimit;
        let min = axis.MinLimit == null ? bounds.Min : axis.MinLimit;

        let range = max - min;
        if (range == 0) range = min;

        let separations = axis.Orientation == LiveChartsCore.AxisOrientation.Y
            ? Math.round(controlSize.Height / h) : Math.round(controlSize.Width / w);

        let minimum = range / separations;

        let magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));

        let residual = minimum / magnitude;
        let tick = residual > 5 ? 10 * magnitude : residual > 2 ? 5 * magnitude : residual > 1 ? 2 * magnitude : magnitude;

        return new LiveChartsCore.AxisTick().Init({Value: tick, Magnitude: magnitude});
    }

    public static GetTickForPolar<TDrawingContext extends LiveChartsCore.DrawingContext>(axis: LiveChartsCore.IPolarAxis, chart: LiveChartsCore.PolarChart<TDrawingContext>, bounds: Nullable<LiveChartsCore.Bounds> = null): LiveChartsCore.AxisTick {
        bounds ??= axis.VisibleDataBounds;

        let max = axis.MaxLimit == null ? bounds.Max : axis.MaxLimit;
        let min = axis.MinLimit == null ? bounds.Min : axis.MinLimit;

        let controlSize = (chart.ControlSize).Clone();
        let minD = controlSize.Width < controlSize.Height ? controlSize.Width : controlSize.Height;
        let radius = minD - chart.InnerRadius;
        let c = minD * chart.TotalAnge / 360;

        let range = max - min;
        let separations = axis.Orientation == LiveChartsCore.PolarAxisOrientation.Angle
            ? Math.round(c / (10 * Extensions.Cf)) : Math.round(radius / (30 * Extensions.Cf));
        let minimum = range / separations;

        let magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.log(10)));

        let residual = minimum / magnitude;
        let tick = residual > 5 ? 10 * magnitude : residual > 2 ? 5 * magnitude : residual > 1 ? 2 * magnitude : magnitude;
        return new LiveChartsCore.AxisTick().Init({Value: tick, Magnitude: magnitude});
    }

    public static TransitionateProperties(animatable: LiveChartsCore.IAnimatable, ...properties: Nullable<string[]>): LiveChartsCore.TransitionBuilder {
        return new LiveChartsCore.TransitionBuilder(animatable, properties);
    }

    public static IsBarSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & LiveChartsCore.SeriesProperties.Bar) != 0;
    }

    public static IsColumnSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & (LiveChartsCore.SeriesProperties.Bar | LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation)) != 0;
    }

    public static IsRowSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & (LiveChartsCore.SeriesProperties.Bar | LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation)) != 0;
    }

    public static IsStackedSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & (LiveChartsCore.SeriesProperties.Stacked)) != 0;
    }

    public static IsVerticalSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & (LiveChartsCore.SeriesProperties.PrimaryAxisVerticalOrientation)) != 0;
    }

    public static IsHorizontalSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & (LiveChartsCore.SeriesProperties.PrimaryAxisHorizontalOrientation)) != 0;
    }

    public static IsFinancialSeries(series: LiveChartsCore.ISeries): boolean {
        return (series.SeriesProperties & LiveChartsCore.SeriesProperties.Financial) != 0;
    }

    public static GetTooltipFindingStrategy(seriesCollection: System.IEnumerable<LiveChartsCore.ISeries>): LiveChartsCore.TooltipFindingStrategy {
        let areAllX = true;
        let areAllY = true;

        for (const series of seriesCollection) {
            areAllX = areAllX && (series.SeriesProperties & LiveChartsCore.SeriesProperties.PrefersXStrategyTooltips) != 0;
            areAllY = areAllY && (series.SeriesProperties & LiveChartsCore.SeriesProperties.PrefersYStrategyTooltips) != 0;
        }

        return areAllX
            ? LiveChartsCore.TooltipFindingStrategy.CompareOnlyXTakeClosest
            : (areAllY ? LiveChartsCore.TooltipFindingStrategy.CompareOnlyYTakeClosest : LiveChartsCore.TooltipFindingStrategy.CompareAllTakeClosest);
    }

    public static FindClosestTo<TModel, TVisual, TLabel>(points: System.IEnumerable<LiveChartsCore.ChartPoint>, point: LiveChartsCore.LvcPoint): Nullable<LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>> {
        let closest = Extensions.FindClosestTo1(points, (point).Clone());
        return closest == null ? null
            : new LiveChartsCore.ChartPoint3<TModel, TVisual, TLabel>(closest);
    }

    public static FindClosestTo1(points: System.IEnumerable<LiveChartsCore.ChartPoint>, point: LiveChartsCore.LvcPoint): Nullable<LiveChartsCore.ChartPoint> {
        let fp = new LiveChartsCore.LvcPoint(point.X, point.Y);

        return points
            .Select(p => {
                return {
                    distance: p.DistanceTo((fp).Clone()),
                    point: p
                }
            })
            .OrderBy(p => p.distance)
            .FirstOrDefault()?.point;
    }

    public static FindClosestTo2<T extends LiveChartsCore.DrawingContext>(source: System.IEnumerable<LiveChartsCore.VisualElement<T>>, point: LiveChartsCore.LvcPoint): Nullable<LiveChartsCore.VisualElement<T>> {
        return source.Select(visual => {
            let location = visual.GetTargetLocation();
            let size = visual.GetTargetSize();

            return {
                distance: Math.sqrt(Math.pow(point.X - (location.X + size.Width * 0.5), 2) +
                    Math.pow(point.Y - (location.Y + size.Height * 0.5), 2)),
                visual
            };
        })
            .OrderBy(p => p.distance)
            .FirstOrDefault()?.visual;
    }

    public static GetNextScaler<TDrawingContext extends LiveChartsCore.DrawingContext>(axis: LiveChartsCore.ICartesianAxis, chart: LiveChartsCore.CartesianChart<TDrawingContext>): LiveChartsCore.Scaler {
        return LiveChartsCore.Scaler.Make((chart.DrawMarginLocation).Clone(), (chart.DrawMarginSize).Clone(), axis);
    }

    public static GetActualScaler<TDrawingContext extends LiveChartsCore.DrawingContext>(axis: LiveChartsCore.ICartesianAxis, chart: LiveChartsCore.CartesianChart<TDrawingContext>): Nullable<LiveChartsCore.Scaler> {
        return !axis.ActualBounds.HasPreviousState
            ? null
            : LiveChartsCore.Scaler.Make(
                (chart.ActualBounds.Location).Clone(),
                (chart.ActualBounds.Size).Clone(),
                axis,
                new LiveChartsCore.Bounds().Init(
                    {
                        Max: axis.ActualBounds.MaxVisibleBound,
                        Min: axis.ActualBounds.MinVisibleBound
                    }));
    }

    public static SelectFirst<T, T1>(source: System.IEnumerable<T>, predicate: System.Func2<T, T1>): System.IEnumerable<T1> {
        const _$generator = function* (source: System.IEnumerable<T>, predicate: System.Func2<T, T1>) {
            for (const item of source) {
                yield predicate(item);
                return;
            }
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(source, predicate));
    }

    public static SplitByNullGaps(points: System.IEnumerable<LiveChartsCore.ChartPoint>,
                                  onDeleteNullPoint: System.Action1<LiveChartsCore.ChartPoint>): System.IEnumerable<System.IEnumerable<LiveChartsCore.ChartPoint>> {
        const _$generator = function* (points: System.IEnumerable<LiveChartsCore.ChartPoint>,
                                       onDeleteNullPoint: System.Action1<LiveChartsCore.ChartPoint>) {
            let builder = new GapsBuilder(points.GetEnumerator());
            while (!builder.Finished) yield Extensions.YieldReturnUntilNextNullChartPoint(builder, onDeleteNullPoint);
            builder.Dispose();
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(points, onDeleteNullPoint));
    }

    public static AsSplineData(source: System.IEnumerable<LiveChartsCore.ChartPoint>): System.IEnumerable<SplineData> {
        const _$generator = function* (source: System.IEnumerable<LiveChartsCore.ChartPoint>) {
            let e = source.Where(x => !x.IsEmpty).GetEnumerator();

            if (!e.MoveNext()) return;
            let data = new SplineData(e.Current);

            if (!e.MoveNext()) {
                yield data;
                return;
            }

            data.GoNext(e.Current);

            while (e.MoveNext()) {
                yield data;
                data.IsFirst = false;
                data.GoNext(e.Current);
            }

            data.IsFirst = false;
            yield data;

            data.GoNext(data.Next);
            yield data;
            e.Dispose();
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(source));
    }


    private static YieldReturnUntilNextNullChartPoint(builder: GapsBuilder,
                                                      onDeleteNullPoint: System.Action1<LiveChartsCore.ChartPoint>): System.IEnumerable<LiveChartsCore.ChartPoint> {
        const _$generator = function* (builder: GapsBuilder,
                                       onDeleteNullPoint: System.Action1<LiveChartsCore.ChartPoint>) {
            while (builder.Enumerator.MoveNext()) {
                if (builder.Enumerator.Current.IsEmpty) {
                    let wasEmpty = builder.IsEmpty;
                    builder.IsEmpty = true;
                    onDeleteNullPoint(builder.Enumerator.Current);
                    if (!wasEmpty) return; // if there are no points then do not return an empty enumerable...
                } else {
                    yield builder.Enumerator.Current;
                    builder.IsEmpty = false;
                }
            }

            builder.Finished = true;
        }
            .bind(this);
        return System.EnumerableFrom(() => _$generator(builder, onDeleteNullPoint));
    }

}

export class GapsBuilder implements System.IDisposable {
    private static readonly $meta_System_IDisposable = true;

    public constructor(enumerator: System.IEnumerator<LiveChartsCore.ChartPoint>) {
        this.Enumerator = enumerator;
    }

    #Enumerator: System.IEnumerator<LiveChartsCore.ChartPoint>;
    public get Enumerator() {
        return this.#Enumerator;
    }

    private set Enumerator(value) {
        this.#Enumerator = value;
    }

    public IsEmpty: boolean = true;

    public Finished: boolean = false;

    public Dispose() {
        this.Enumerator.Dispose();
    }
}

export class SplineData {
    public constructor(start: LiveChartsCore.ChartPoint) {
        this.Previous = start;
        this.Current = start;
        this.Next = start;
        this.AfterNext = start;
    }

    public Previous: LiveChartsCore.ChartPoint;

    public Current: LiveChartsCore.ChartPoint;

    public Next: LiveChartsCore.ChartPoint;

    public AfterNext: LiveChartsCore.ChartPoint;

    public IsFirst: boolean = true;

    public GoNext(point: LiveChartsCore.ChartPoint) {
        this.Previous = this.Current;
        this.Current = this.Next;
        this.Next = this.AfterNext;
        this.AfterNext = point;
    }
}
