import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export interface ISeries {
    get SeriesId(): number;

    set SeriesId(value: number);

    get SeriesProperties(): LiveChartsCore.SeriesProperties;


    get PaintsChanged(): boolean;

    set PaintsChanged(value: boolean);

    get ActivePoints(): System.HashSet<LiveChartsCore.ChartPoint>;


    get RequiresFindClosestOnPointerDown(): boolean;


    get Name(): Nullable<string>;

    set Name(value: Nullable<string>);


    get IsVisible(): boolean;

    set IsVisible(value: boolean);

    get IsHoverable(): boolean;

    set IsHoverable(value: boolean);

    get IsVisibleAtLegend(): boolean;

    set IsVisibleAtLegend(value: boolean);

    get DataPadding(): LiveChartsCore.LvcPoint;

    set DataPadding(value: LiveChartsCore.LvcPoint);

    get ZIndex(): number;

    set ZIndex(value: number);

    get Pivot(): number;

    set Pivot(value: number);

    get AnimationsSpeed(): Nullable<System.TimeSpan>;

    set AnimationsSpeed(value: Nullable<System.TimeSpan>);

    get EasingFunction(): Nullable<System.Func2<number, number>>;

    set EasingFunction(value: Nullable<System.Func2<number, number>>);


    GetTooltipText(point: LiveChartsCore.ChartPoint): string;

    GetDataLabelText(point: LiveChartsCore.ChartPoint): string;

    Fetch(chart: LiveChartsCore.IChart): System.IEnumerable<LiveChartsCore.ChartPoint>;

    FindHitPoints(chart: LiveChartsCore.IChart, pointerPosition: LiveChartsCore.LvcPoint, strategy: LiveChartsCore.TooltipFindingStrategy): System.IEnumerable<LiveChartsCore.ChartPoint>;

    OnPointerEnter(point: LiveChartsCore.ChartPoint): void;

    OnPointerLeft(point: LiveChartsCore.ChartPoint): void;

    RestartAnimations(): void;

    SoftDeleteOrDispose(chart: LiveChartsCore.IChartView): void;
}

export function IsInterfaceOfISeries(obj: any): obj is ISeries {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_ISeries' in obj.constructor;
}

export interface ISeries1<TModel> extends ISeries {
    get Mapping(): Nullable<System.Action2<TModel, LiveChartsCore.ChartPoint>>;

    set Mapping(value: Nullable<System.Action2<TModel, LiveChartsCore.ChartPoint>>);

    get Values(): Nullable<System.IEnumerable<TModel>>;

    set Values(value: Nullable<System.IEnumerable<TModel>>);
}
