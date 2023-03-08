import * as LiveChartsCore from '@/LiveChartsCore'

export interface IMoveToPathCommand<TPath> extends LiveChartsCore.IPathCommand<TPath> {
    get X(): number;

    set X(value: number);

    get Y(): number;

    set Y(value: number);
}
