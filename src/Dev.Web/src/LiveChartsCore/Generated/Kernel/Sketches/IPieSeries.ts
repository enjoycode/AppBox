import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPieSeries<TDrawingContext extends LiveChartsCore.DrawingContext> extends LiveChartsCore.IChartSeries<TDrawingContext>, LiveChartsCore.IStrokedAndFilled<TDrawingContext> {
    get Pushout(): number;

    set Pushout(value: number);

    get InnerRadius(): number;

    set InnerRadius(value: number);

    get MaxOuterRadius(): number;

    set MaxOuterRadius(value: number);

    get HoverPushout(): number;

    set HoverPushout(value: number);

    get CornerRadius(): number;

    set CornerRadius(value: number);

    get InvertedCornerRadius(): boolean;

    set InvertedCornerRadius(value: boolean);

    get MaxRadialColumnWidth(): number;

    set MaxRadialColumnWidth(value: number);

    get DataLabelsPosition(): LiveChartsCore.PolarLabelsPosition;

    set DataLabelsPosition(value: LiveChartsCore.PolarLabelsPosition);

    get RadialAlign(): LiveChartsCore.RadialAlignment;

    set RadialAlign(value: LiveChartsCore.RadialAlignment);

    get RelativeInnerRadius(): number;

    set RelativeInnerRadius(value: number);

    get RelativeOuterRadius(): number;

    set RelativeOuterRadius(value: number);

    get IsFillSeries(): boolean;

    set IsFillSeries(value: boolean);

    GetBounds(chart: LiveChartsCore.PieChart<TDrawingContext>): LiveChartsCore.DimensionalBounds;
}

export function IsInterfaceOfIPieSeries(obj: any): obj is IPieSeries<any> {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IPieSeries' in obj.constructor;
}
