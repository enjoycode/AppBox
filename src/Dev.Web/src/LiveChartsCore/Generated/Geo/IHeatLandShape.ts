import * as LiveChartsCore from '@/LiveChartsCore'

export interface IHeatPathShape extends LiveChartsCore.IAnimatable {
    get FillColor(): LiveChartsCore.LvcColor;

    set FillColor(value: LiveChartsCore.LvcColor);
}
