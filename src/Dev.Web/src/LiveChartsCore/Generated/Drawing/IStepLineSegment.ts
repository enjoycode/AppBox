import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStepLineSegment<TPathContext> extends LiveChartsCore.IPathCommand<TPathContext> {
    get X0(): number;

    set X0(value: number);

    get Y0(): number;

    set Y0(value: number);

    get X1(): number;

    set X1(value: number);

    get Y1(): number;

    set Y1(value: number);
}
