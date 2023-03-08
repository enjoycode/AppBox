import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface IPlane {
    get Name(): Nullable<string>;

    set Name(value: Nullable<string>);

    get NameTextSize(): number;

    set NameTextSize(value: number);

    get NamePadding(): LiveChartsCore.Padding;

    set NamePadding(value: LiveChartsCore.Padding);

    get ActualBounds(): LiveChartsCore.AnimatableAxisBounds;


    get DataBounds(): LiveChartsCore.Bounds;


    get VisibleDataBounds(): LiveChartsCore.Bounds;


    get Labeler(): System.Func2<number, string>;

    set Labeler(value: System.Func2<number, string>);

    get MinStep(): number;

    set MinStep(value: number);

    get ForceStepToMin(): boolean;

    set ForceStepToMin(value: boolean);

    get UnitWidth(): number;

    set UnitWidth(value: number);

    get MinLimit(): Nullable<number>;

    set MinLimit(value: Nullable<number>);

    get MaxLimit(): Nullable<number>;

    set MaxLimit(value: Nullable<number>);

    get IsVisible(): boolean;

    set IsVisible(value: boolean);

    get IsInverted(): boolean;

    set IsInverted(value: boolean);

    get LabelsRotation(): number;

    set LabelsRotation(value: number);

    get TextSize(): number;

    set TextSize(value: number);

    get Labels(): Nullable<System.IList<string>>;

    set Labels(value: Nullable<System.IList<string>>);

    get AnimationsSpeed(): Nullable<System.TimeSpan>;

    set AnimationsSpeed(value: Nullable<System.TimeSpan>);

    get EasingFunction(): Nullable<System.Func2<number, number>>;

    set EasingFunction(value: Nullable<System.Func2<number, number>>);

    get ShowSeparatorLines(): boolean;

    set ShowSeparatorLines(value: boolean);
}

export interface IPlane1<TDrawingContext extends LiveChartsCore.DrawingContext> extends IPlane, LiveChartsCore.IChartElement<TDrawingContext> {
    get NamePaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set NamePaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get LabelsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set LabelsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    get SeparatorsPaint(): Nullable<LiveChartsCore.IPaint<TDrawingContext>>;

    set SeparatorsPaint(value: Nullable<LiveChartsCore.IPaint<TDrawingContext>>);

    GetPossibleSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize;

    GetNameLabelSize(chart: LiveChartsCore.Chart<TDrawingContext>): LiveChartsCore.LvcSize;
}
