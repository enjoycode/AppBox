import * as LiveChartsCore from '@/LiveChartsCore'

export interface ICubicBezierPathCommand<SKPath> extends LiveChartsCore.IPathCommand<SKPath> {
    get X0(): number;

    set X0(value: number);

    get Y0(): number;

    set Y0(value: number);

    get X1(): number;

    set X1(value: number);

    get Y1(): number;

    set Y1(value: number);

    get X2(): number;

    set X2(value: number);

    get Y2(): number;

    set Y2(value: number);
}
