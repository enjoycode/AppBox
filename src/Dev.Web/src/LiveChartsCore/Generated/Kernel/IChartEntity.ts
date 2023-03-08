import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export interface IChartEntity {
    get EntityIndex(): number;

    set EntityIndex(value: number);

    get ChartPoints(): Nullable<System.ObjectMap<LiveChartsCore.ChartPoint>>;

    set ChartPoints(value: Nullable<System.ObjectMap<LiveChartsCore.ChartPoint>>);

    get Coordinate(): LiveChartsCore.Coordinate;

}

export function IsInterfaceOfIChartEntity(obj: any): obj is IChartEntity {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IChartEntity' in obj.constructor;
}
