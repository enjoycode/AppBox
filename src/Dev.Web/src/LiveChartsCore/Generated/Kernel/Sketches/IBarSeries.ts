import * as LiveChartsCore from '@/LiveChartsCore'

export interface IBarSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IStrokedAndFilled<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get Rx(): number;

    set Rx(value: number);

    get Ry(): number;

    set Ry(value: number);

    get Padding(): number;

    set Padding(value: number);

    get MaxBarWidth(): number;

    set MaxBarWidth(value: number);

    get IgnoresBarPosition(): boolean;

    set IgnoresBarPosition(value: boolean);
}
