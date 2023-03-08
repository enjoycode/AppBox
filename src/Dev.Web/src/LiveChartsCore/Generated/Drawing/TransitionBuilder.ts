import * as System from '@/System'
import * as LiveChartsCore from '@/LiveChartsCore'

export class TransitionBuilder {
    private readonly _properties: Nullable<string[]>;
    private readonly _target: LiveChartsCore.IAnimatable;

    public constructor(target: LiveChartsCore.IAnimatable, properties: Nullable<string[]>) {
        this._target = target;
        this._properties = properties;
    }

    public WithAnimation(animation: LiveChartsCore.Animation): TransitionBuilder {
        this._target.SetTransition(animation, ...this._properties);
        return this;
    }

    public WithAnimationBuilder(animationBuilder: System.Action1<LiveChartsCore.Animation>): TransitionBuilder {
        let animation = new LiveChartsCore.Animation();
        animationBuilder(animation);
        return this.WithAnimation(animation);
    }

    public WithAnimationFromChart(chart: LiveChartsCore.IChart): TransitionBuilder {
        return this.WithAnimation(new LiveChartsCore.Animation()
            .WithDuration(chart.View.AnimationsSpeed)
            .WithEasingFunction(chart.View.EasingFunction));
    }

    public CompleteCurrentTransitions(): TransitionBuilder {
        this._target.CompleteTransition(...this._properties);
        return this;
    }
}
