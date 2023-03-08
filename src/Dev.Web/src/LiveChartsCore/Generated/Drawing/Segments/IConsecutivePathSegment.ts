import * as LiveChartsCore from '@/LiveChartsCore'

export interface IConsecutivePathSegment extends LiveChartsCore.IAnimatable {
    get Id(): number;


    get Xi(): number;


    get Xj(): number;


    get Yi(): number;


    get Yj(): number;


    Follows(segment: IConsecutivePathSegment): void;
}
