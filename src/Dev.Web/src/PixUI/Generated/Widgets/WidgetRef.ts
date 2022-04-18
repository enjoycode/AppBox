import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// Widget实例的引用
/// </summary>
export class WidgetRef<T extends PixUI.Widget> implements IWidgetRef {
    #Widget: Nullable<T>;
    public get Widget() {
        return this.#Widget;
    }

    private set Widget(value) {
        this.#Widget = value;
    }

    public SetWidget(widget: PixUI.Widget) {
        this.Widget = <T><unknown>widget;
    }

    public Init(props: Partial<WidgetRef<T>>): WidgetRef<T> {
        Object.assign(this, props);
        return this;
    }
}

export interface IWidgetRef {
    SetWidget(widget: PixUI.Widget): void;
}
