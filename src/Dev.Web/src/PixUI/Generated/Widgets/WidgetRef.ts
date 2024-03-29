import * as PixUI from '@/PixUI'

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
}

export interface IWidgetRef {
    SetWidget(widget: PixUI.Widget): void;
}
