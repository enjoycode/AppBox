import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export abstract class Animatable implements LiveChartsCore.IAnimatable {
    private static readonly $meta_LiveChartsCore_IAnimatable = true;

    protected constructor() {
    }

    public IsValid: boolean = true;

    public CurrentTime: bigint = BigInt('-9223372036854775808');

    public RemoveOnCompleted: boolean = false;

    public get MotionProperties(): System.Dictionary<string, LiveChartsCore.IMotionProperty> {
        return new System.Dictionary();
    }

    public SetTransition(animation: Nullable<LiveChartsCore.Animation>, ...propertyName: Nullable<string[]>) {
        let a = animation?.Duration == 0n ? null : animation;
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const name of propertyName) {
            this.MotionProperties.GetAt(name).Animation = a;
        }
    }

    public RemoveTransition(...propertyName: Nullable<string[]>) {
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const name of propertyName) {
            this.MotionProperties.GetAt(name).Animation = null;
        }
    }

    public CompleteTransition(...propertyName: Nullable<string[]>) {
        if (propertyName == null || propertyName.length == 0) propertyName = this.MotionProperties.Keys.ToArray();

        for (const property of propertyName) {
            let transitionProperty: any;
            if (!this.MotionProperties.TryGetValue(property, new System.Out(() => transitionProperty, $v => transitionProperty = $v)))
                throw new System.Exception(`The property ${property} is not a transition property of this instance.`);

            if (transitionProperty.Animation == null) continue;
            transitionProperty.IsCompleted = true;
        }
    }

    protected RegisterMotionProperty<T extends LiveChartsCore.IMotionProperty>(motionProperty: T): T {
        this.MotionProperties.SetAt(motionProperty.PropertyName, motionProperty);
        return motionProperty;
    }
}
