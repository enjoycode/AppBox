import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Animatable implements LiveChartsCore.IAnimatable {
    private static readonly $meta_LiveChartsCore_IAnimatable = true;

    protected constructor() {
    }

    public IsValid: boolean = true;

    public CurrentTime: bigint = BigInt('-9223372036854775808');

    public RemoveOnCompleted: boolean = false;

    public get MotionProperties(): System.StringMap<LiveChartsCore.IMotionProperty> {
        return new System.StringMap();
    }

    public SetTransition(animation: Nullable<LiveChartsCore.Animation>, ...propertyName: Nullable<string[]>) {
        let a = animation?.Duration == 0n ? null : animation;
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const name of propertyName) {
            this.MotionProperties.get(name)!.Animation = a;
        }
    }

    public RemoveTransition(...propertyName: Nullable<string[]>) {
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const name of propertyName) {
            this.MotionProperties.get(name)!.Animation = null;
        }
    }

    public CompleteTransition(...propertyName: Nullable<string[]>) {
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const property of propertyName) {
            let transitionProperty = this.MotionProperties.get(property);
            if (transitionProperty == null)
                throw new System.Exception(`The property ${property} is not a transition property of this instance.`);

            if (transitionProperty.Animation == null) continue;
            transitionProperty.IsCompleted = true;
        }
    }

    protected RegisterMotionProperty<T extends LiveChartsCore.IMotionProperty>(motionProperty: T): T {
        this.MotionProperties.set(motionProperty.PropertyName, motionProperty);
        return motionProperty;
    }
}
