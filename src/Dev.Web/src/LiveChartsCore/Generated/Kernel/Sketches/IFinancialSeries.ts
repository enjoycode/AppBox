import * as LiveChartsCore from '@/LiveChartsCore'

export interface IFinancialSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get MaxBarWidth(): number;

    set MaxBarWidth(value: number);

    get UpStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set UpStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get DownStroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set DownStroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get UpFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set UpFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get DownFill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set DownFill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);
}
