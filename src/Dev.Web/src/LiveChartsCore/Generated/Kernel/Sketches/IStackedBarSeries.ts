import * as LiveChartsCore from '@/LiveChartsCore'

export interface IStackedBarSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IStrokedAndFilled<TDrawingContext>, LiveChartsCore.ICartesianSeries<TDrawingContext> {
    get Rx(): number;

    set Rx(value: number);

    get Ry(): number;

    set Ry(value: number);

    // /// <summary>
    // /// Gets or sets the padding for each group of bars that share the same secondary coordinate.
    // /// </summary>
    // /// <value>
    // /// The bar group padding.
    // /// </value>
    // double GroupPadding { get; set; }

    get MaxBarWidth(): number;

    set MaxBarWidth(value: number);

    get StackGroup(): number;

    set StackGroup(value: number);
}
