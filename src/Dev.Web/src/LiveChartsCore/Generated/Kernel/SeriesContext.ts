import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class SeriesContext<TDrawingContext extends LiveChartsCore.DrawingContext> {
    private readonly _series: System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>>;

    private _columnsCount: number = 0;
    private _rowsCount: number = 0;
    private _stackedColumnsCount: number = 0;
    private _stackedRowsCount: number = 0;
    private _areBarsIndexed: boolean = false;

    private readonly _columnPositions: System.Dictionary<LiveChartsCore.IChartSeries<TDrawingContext>, number> = new System.Dictionary();
    private readonly _rowPositions: System.Dictionary<LiveChartsCore.IChartSeries<TDrawingContext>, number> = new System.Dictionary();
    private readonly _stackColumnPositions: System.Dictionary<number, number> = new System.Dictionary();
    private readonly _stackRowsPositions: System.Dictionary<number, number> = new System.Dictionary();

    private readonly _stackers: System.Dictionary<string, LiveChartsCore.Stacker<TDrawingContext>> = new System.Dictionary();

    public constructor(series: System.IEnumerable<LiveChartsCore.IChartSeries<TDrawingContext>>) {
        this._series = series;
    }


    public GetColumnPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._columnPositions.GetAt(series);
        this.IndexBars();
        return this._columnPositions.GetAt(series);
    }

    public GetColumnSeriesCount(): number {
        if (this._areBarsIndexed) return this._columnsCount;
        this.IndexBars();
        return this._columnsCount;
    }

    public GetRowPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._rowPositions.GetAt(series);
        this.IndexBars();
        return this._rowPositions.GetAt(series);
    }

    public GetRowSeriesCount(): number {
        if (this._areBarsIndexed) return this._rowsCount;
        this.IndexBars();
        return this._rowsCount;
    }

    public GetStackedColumnPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._stackColumnPositions.GetAt(series.GetStackGroup());
        this.IndexBars();
        return this._stackColumnPositions.GetAt(series.GetStackGroup());
    }

    public GetStackedColumnSeriesCount(): number {
        if (this._areBarsIndexed) return this._stackedColumnsCount;
        this.IndexBars();
        return this._stackedColumnsCount;
    }

    public GetStackedRowPostion(series: LiveChartsCore.IChartSeries<TDrawingContext>): number {
        if (this._areBarsIndexed) return this._stackRowsPositions.GetAt(series.GetStackGroup());
        this.IndexBars();
        return this._stackRowsPositions.GetAt(series.GetStackGroup());
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
                    this._columnPositions.SetAt(item, this._columnsCount++);
                    continue;
                }

                if (!this._stackColumnPositions.ContainsKey(item.GetStackGroup()))
                    this._stackColumnPositions.SetAt(item.GetStackGroup(), this._stackedColumnsCount++);

                continue;
            }

            if (LiveChartsCore.Extensions.IsRowSeries(item,)) {
                if (!LiveChartsCore.Extensions.IsRowSeries(item,)) {
                    this._rowPositions.SetAt(item, this._rowsCount++);
                    continue;
                }

                if (!this._stackRowsPositions.ContainsKey(item.GetStackGroup()))
                    this._stackRowsPositions.SetAt(item.GetStackGroup(), this._stackedRowsCount++);

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
        let stacker: any;
        let key = `${series.SeriesProperties}.${stackGroup}`;

        if (!this._stackers.TryGetValue(key, new System.Out(() => stacker, $v => stacker = $v))) {
            stacker = new LiveChartsCore.Stacker<TDrawingContext>();
            this._stackers.Add(key, stacker);
        }

        return stacker;
    }

}
