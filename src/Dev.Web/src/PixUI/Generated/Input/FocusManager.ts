import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class FocusManager {
    #FocusedWidget: Nullable<PixUI.Widget>;
    public get FocusedWidget() {
        return this.#FocusedWidget;
    }

    private set FocusedWidget(value) {
        this.#FocusedWidget = value;
    }

    public Focus(widget: Nullable<PixUI.Widget>) {
        if ((this.FocusedWidget === widget))
            return; //Already focused

        if (this.FocusedWidget != null) {
            (<PixUI.IFocusable><any>this.FocusedWidget).FocusNode.RaiseFocusChanged(false);
            this.FocusedWidget = null;
        }

        if (PixUI.IsInterfaceOfIFocusable(widget)) {
            this.FocusedWidget = widget;
            (<PixUI.IFocusable><any>this.FocusedWidget).FocusNode.RaiseFocusChanged(true);
        }
    }

    public OnKeyDown(e: PixUI.KeyEvent) {
        if (this.FocusedWidget == null) return;
        FocusManager.PropagateEvent(this.FocusedWidget, e, (w, e) => (<PixUI.IFocusable><any>w).FocusNode.RaiseKeyDown(e));
    }

    public OnKeyUp(e: PixUI.KeyEvent) {
        if (this.FocusedWidget == null) return;
        FocusManager.PropagateEvent(this.FocusedWidget, e, (w, e) => (<PixUI.IFocusable><any>w).FocusNode.RaiseKeyUp(e));
    }

    public OnTextInput(text: string) {
        (<PixUI.IFocusable><any>this.FocusedWidget!).FocusNode.RaiseTextInput(text);
    }

    private static PropagateEvent<T extends PixUI.PropagateEvent>(widget: Nullable<PixUI.Widget>, theEvent: T, handler: System.Action2<PixUI.Widget, T>) {
        while (true) {
            if (widget == null) return;

            if (PixUI.IsInterfaceOfIFocusable(widget)) {
                handler(widget, theEvent);
                if (theEvent.IsHandled) return;
            }

            widget = widget.Parent;
        }
    }

    public Init(props: Partial<FocusManager>): FocusManager {
        Object.assign(this, props);
        return this;
    }
}
