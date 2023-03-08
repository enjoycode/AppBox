import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPathCommand<TPathContext> extends LiveChartsCore.IAnimatable {
    get Id(): number;

    set Id(value: number);

    Execute(path: TPathContext, currentTime: bigint, pathGeometry: LiveChartsCore.Animatable): void;
}
