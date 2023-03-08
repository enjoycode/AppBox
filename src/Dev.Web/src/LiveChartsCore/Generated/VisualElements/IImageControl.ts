import * as LiveChartsCore from '@/LiveChartsCore'

export interface IImageControl {
    get Size(): LiveChartsCore.LvcSize;


    Measure(chart: LiveChartsCore.IChart): void;
}

export function IsInterfaceOfIImageControl(obj: any): obj is IImageControl {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IImageControl' in obj.constructor;
}
