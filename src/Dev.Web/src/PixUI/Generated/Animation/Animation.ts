import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Animation<T> {
    public abstract get ValueChanged(): System.Event;

    public abstract get StatusChanged(): System.Event<PixUI.AnimationStatus>;

    public abstract get Value(): T ;


    public abstract get Status(): PixUI.AnimationStatus ;


    public get IsDismissed(): boolean {
        return this.Status == PixUI.AnimationStatus.Dismissed;
    }

    public get IsCompleted(): boolean {
        return this.Status == PixUI.AnimationStatus.Completed;
    }
}

export abstract class AnimationWithParent<T> extends Animation<T> {
    protected readonly Parent: Animation<number>;

    public constructor(parent: Animation<number>) {
        super();
        this.Parent = parent;
    }

    public get Status(): PixUI.AnimationStatus {
        return this.Parent.Status;
    }

    public get ValueChanged(): System.Event {
        return this.Parent.ValueChanged;
    }

    public get StatusChanged(): System.Event<PixUI.AnimationStatus> {
        return this.Parent.StatusChanged;
    }
}

export class AnimatedEvaluation<T> extends AnimationWithParent<T> {
    private readonly _evaluatable: PixUI.Animatable<T>;

    public constructor(parent: Animation<number>, evaluatable: PixUI.Animatable<T>) {
        super(parent);
        this._evaluatable = evaluatable;
    }

    public get Value(): T {
        return this._evaluatable.Evaluate(this.Parent);
    }
}
