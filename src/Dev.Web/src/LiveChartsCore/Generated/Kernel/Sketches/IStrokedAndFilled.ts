import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStrokedAndFilled<TDrawingContext extends LiveChartsCore.DrawingContext> {
    get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);
}
