import * as LiveChartsCore from '@/LiveChartsCore'
import * as System from '@/System'

export interface IAnimatable {
    get IsValid(): boolean;

    set IsValid(value: boolean);

    get CurrentTime(): bigint;

    set CurrentTime(value: bigint);

    get RemoveOnCompleted(): boolean;

    set RemoveOnCompleted(value: boolean);

    get MotionProperties(): System.StringMap<LiveChartsCore.IMotionProperty>;


    SetTransition(animation: Nullable<LiveChartsCore.Animation>, ...propertyName: Nullable<string[]>): void;

    RemoveTransition(...propertyName: Nullable<string[]>): void;

    CompleteTransition(...propertyName: Nullable<string[]>): void;
}

export function IsInterfaceOfIAnimatable(obj: any): obj is IAnimatable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_LiveChartsCore_IAnimatable' in obj.constructor;
}
