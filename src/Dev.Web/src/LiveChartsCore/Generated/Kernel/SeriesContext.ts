import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SeriesContext<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private readonly _series: System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>>;

    private _columnsCount: number = 0;
    private _rowsCount: number = 0;
    private _stackedColumnsCount: number = 0;
    private _stackedRowsCount: number = 0;
    private _areBarsIndexed: boolean = false;

    private readonly _columnPositions: System.ObjectMap<number> = new System.ObjectMap();
    private readonly _rowPositions: System.ObjectMap<number> = new System.ObjectMap();
    private readonly _stackColumnPositions: System.NumberMap<number> = new System.NumberMap();
    private readonly _stackRowsPositions: System.NumberMap<number> = new System.NumberMap();

    private readonly _stackers: System.StringMap<LiveChartsCore.Stacker<TDrawingContext>> = new System.StringMap();

    public constructor(series: System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>>) {
        this._series = series;
    }


    public GetColumnPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._columnPositions.get(series);
        this.IndexBars();
        return this._columnPositions.get(series);
    }

    public GetColumnSeriesCount(): number {
        if (this._areBarsIndexed) return this._columnsCount;
        this.IndexBars();
        return this._columnsCount;
    }

    public GetRowPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._rowPositions.get(series);
        this.IndexBars();
        return this._rowPositions.get(series);
    }

    public GetRowSeriesCount(): number {
        if (this._areBarsIndexed) return this._rowsCount;
        this.IndexBars();
        return this._rowsCount;
    }

    public GetStackedColumnPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._stackColumnPositions.get(series.GetStackGroup());
        this.IndexBars();
        return this._stackColumnPositions.get(series.GetStackGroup());
    }

    public GetStackedColumnSeriesCount(): number {
        if (this._areBarsIndexed) return this._stackedColumnsCount;
        this.IndexBars();
        return this._stackedColumnsCount;
    }

    public GetStackedRowPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._stackRowsPositions.get(series.GetStackGroup());
        this.IndexBars();
        return this._stackRowsPositions.get(series.GetStackGroup());
    }

    public GetStackedRowSeriesCount(): number {
        if (this._areBarsIndexed) return this._stackedRowsCount;
        this.IndexBars();
        return this._stackedRowsCount;
    }

    private IndexBars() {
        this._columnsCount = 0;
        this._rowsCount = 0;
        this._stackedColumnsCount = 0;
        this._stackedRowsCount = 0;

        for (const item of this._series) {
            if (!LiveChartsCore.Extensions.IsBarSeries(item,)) continue;

            if (LiveChartsCore.Extensions.IsColumnSeries(item,)) {
                if (!LiveChartsCore.Extensions.IsStackedSeries(item,)) {
                    this._columnPositions.set(item, this._columnsCount++);
                    continue;
                }

                if (!this._stackColumnPositions.has(item.GetStackGroup()))
                    this._stackColumnPositions.set(item.GetStackGroup(), this._stackedColumnsCount++);
                continue;
            }

            if (LiveChartsCore.Extensions.IsRowSeries(item,)) {
                if (!LiveChartsCore.Extensions.IsRowSeries(item,)) {
                    this._rowPositions.set(item, this._rowsCount++);
                    continue;
                }

                if (!this._stackRowsPositions.has(item.GetStackGroup()))
                    this._stackRowsPositions.set(item.GetStackGroup(), this._stackedRowsCount++);

                continue;
            }
        }

        this._areBarsIndexed = true;
    }


    public GetStackPosition(series: LiveChartsCore.IChartSeries<TDrawingContext>, stackGroup: number): Nullable<LiveChartsCore.StackPosition<TDrawingContext>> {
        if (!LiveChartsCore.Extensions.IsStackedSeries(series,)) return null;

        let s = this.GetStacker(series, stackGroup);

        return s == null ? null
            : new LiveChartsCore.StackPosition<TDrawingContext>().Init(
                {
                    Stacker: s,
                    Position: s.GetSeriesStackPosition(series)
                });
    }

    private GetStacker(series: LiveChartsCore.IChartSeries<TDrawingContext>, stackGroup: number): LiveChartsCore.Stacker<TDrawingContext> {
        let key = `${series.SeriesProperties}.${stackGroup}`;

        let stacker = this._stackers.get(key);
        if (stacker == null) {
            stacker = new LiveChartsCore.Stacker<TDrawingContext>();
            this._stackers.set(key, stacker);
        }

        return stacker;
    }

}
