import * as LiveChartsCore from '@/LiveChartsCore'

export interface IRoundedRectangleChartPoint<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.ISizedVisualChartPoint<TDrawingContext> {
    get Rx(): number;

    set Rx(value: number);

    get Ry(): number;

    set Ry(value: number);
}

export function IsInterfaceOfIRoundedRectangleChartPoint(obj: any): obj is IRoundedRectangleChartPoint<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IRoundedRectangleChartPoint' in obj.constructor;
}
