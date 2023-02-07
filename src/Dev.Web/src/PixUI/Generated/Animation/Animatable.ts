import * as PixUI from '@/PixUI'
/// <summary>
/// 根据Animation<double>生成指定T的值
/// </summary>
export abstract class Animatable<T> {
    /// <summary>
    /// Returns the value of the object at point `t`.
    /// </summary>
    public abstract Transform(t: number): T ;

    /// <summary>
    /// The current value of this object for the given [Animation].
    /// </summary>
    public Evaluate(animation: PixUI.Animation<number>): T {
        return this.Transform(animation.Value);
    }

    /// <summary>
    /// Returns a new [Animation] that is driven by the given animation but that
    /// takes on values determined by this object.
    /// </summary>
    public Animate(parent: PixUI.Animation<number>): PixUI.Animation<T> {
        return new PixUI.AnimatedEvaluation<T>(parent, this);
    }

    /// <summary>
    /// Returns a new [Animatable] whose value is determined by first evaluating
    /// the given parent and then evaluating this object.
    /// </summary>
    public Chain(parent: Animatable<number>): Animatable<T> {
        return new ChainedEvaluation<T>(parent, this);
    }
}

export class ChainedEvaluation<T> extends Animatable<T> {
    private readonly _parent: Animatable<number>;
    private readonly _evaluatable: Animatable<T>;

    public constructor(parent: Animatable<number>, evaluatable: Animatable<T>) {
        super();
        this._parent = parent;
        this._evaluatable = evaluatable;
    }

    public Transform(t: number): T {
        return this._evaluatable.Transform(this._parent.Transform(t));
    }
}
