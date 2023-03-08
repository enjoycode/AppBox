import * as LiveChartsCore from '@/LiveChartsCore'

export interface IGeoSeries {
    get IsVisible(): boolean;

    set IsVisible(value: boolean);
}

export interface IGeoSeries1<TDrawingContext extends LiveChartsCore.DrawingContext> extends IGeoSeries {
    Measure(context: LiveChartsCore.MapContext<TDrawingContext>): void;

    Delete(context: LiveChartsCore.MapContext<TDrawingContext>): void;
}
