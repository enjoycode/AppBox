import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPaintable<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IDrawable<TDrawingContext> {
    get Stroke(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Stroke(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get Fill(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Fill(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get Opacity(): number;

    set Opacity(value: number);
}
