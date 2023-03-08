import * as LiveChartsCore from '@/LiveChartsCore'

export interface ISizedGeometry<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IGeometry<TDrawingContext> {
    get Width(): number;

    set Width(value: number);

    get Height(): number;

    set Height(value: number);
}
