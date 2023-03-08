import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IGaugeBuilder<TDrawingContext extends LiveChartsCore.DrawingContext> {
    get InnerRadius(): Nullable<number>;

    set InnerRadius(value: Nullable<number>);

    get OffsetRadius(): Nullable<number>;

    set OffsetRadius(value: Nullable<number>);

    get MaxColumnWidth(): Nullable<number>;

    set MaxColumnWidth(value: Nullable<number>);

    get CornerRadius(): Nullable<number>;

    set CornerRadius(value: Nullable<number>);

    get RadialAlign(): Nullable<LiveChartsCore.RadialAlignment>;

    set RadialAlign(value: Nullable<LiveChartsCore.RadialAlignment>);

    get BackgroundInnerRadius(): Nullable<number>;

    set BackgroundInnerRadius(value: Nullable<number>);

    get BackgroundOffsetRadius(): Nullable<number>;

    set BackgroundOffsetRadius(value: Nullable<number>);

    get BackgroundMaxRadialColumnWidth(): Nullable<number>;

    set BackgroundMaxRadialColumnWidth(value: Nullable<number>);

    get BackgroundCornerRadius(): Nullable<number>;

    set BackgroundCornerRadius(value: Nullable<number>);

    get Background(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set Background(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get LabelsSize(): Nullable<number>;

    set LabelsSize(value: Nullable<number>);

    get LabelsPosition(): Nullable<LiveChartsCore.PolarLabelsPosition>;

    set LabelsPosition(value: Nullable<LiveChartsCore.PolarLabelsPosition>);

    get LabelFormatter(): System.Func2<LiveChartsCore.ChartPoint, string>;

    set LabelFormatter(value: System.Func2<LiveChartsCore.ChartPoint, string>);
}
