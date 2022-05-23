import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class WidgetController<T extends PixUI.Widget> {
    private _widget: Nullable<T>;

    public get Widget(): T {
        return this._widget!;
    }

    public AttachWidget(widget: T) {
        if (this._widget != null) throw new System.InvalidOperationException();
        this._widget = widget;
    }
}
