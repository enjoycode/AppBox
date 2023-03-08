import * as LiveChartsCore from '@/LiveChartsCore'

export interface ILineGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IGeometry<TDrawingContext> {
    get X1(): number;

    set X1(value: number);

    get Y1(): number;

    set Y1(value: number);
}
