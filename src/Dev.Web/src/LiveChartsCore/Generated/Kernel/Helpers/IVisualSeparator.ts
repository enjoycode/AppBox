import * as LiveChartsCore from '@/LiveChartsCore'

export interface IVisualSeparator<TDrawingContext extends LiveChartsCore.DrawingContext> {
    get Value(): number;

    set Value(value: number);

    get Label(): Nullable<LiveChartsCore.ILabelGeometry<TDrawingContext>>;

    set Label(value: Nullable<LiveChartsCore.ILabelGeometry<TDrawingContext>>);

    get Geometry(): Nullable<LiveChartsCore.IGeometry<TDrawingContext>>;

}
