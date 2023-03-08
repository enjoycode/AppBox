import * as LiveChartsCore from '@/LiveChartsCore'

export interface IMotionProperty {
    get IsCompleted(): boolean;

    set IsCompleted(value: boolean);

    get PropertyName(): string;


    get Animation(): Nullable<LiveChartsCore.Animation>;

    set Animation(value: Nullable<LiveChartsCore.Animation>);

    CopyFrom(source: IMotionProperty): void;
}
