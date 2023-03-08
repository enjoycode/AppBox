import * as LiveChartsCore from '@/LiveChartsCore'

export interface IFinancialGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IGeometry<TDrawingContext> {
    get Width(): number;

    set Width(value: number);

    get Open(): number;

    set Open(value: number);

    get Close(): number;

    set Close(value: number);

    get Low(): number;

    set Low(value: number);
}
