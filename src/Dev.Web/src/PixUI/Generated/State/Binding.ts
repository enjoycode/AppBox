import * as System from '@/System'
import * as PixUI from '@/PixUI'

export enum BindingOptions {
    None = 0,
    AffectsVisual = 1,
    AffectsLayout = 2
}

export class Binding {
    public readonly Target: WeakRef<any>;
    public readonly Options: BindingOptions;

    public constructor(target: PixUI.IStateBindable, options: BindingOptions = BindingOptions.None) {
        this.Target = new WeakRef<any>(target);
        this.Options = options;
    }

    //public Binding Clone() => new Binding((IStateBindable)Target.Target, Options);
}
