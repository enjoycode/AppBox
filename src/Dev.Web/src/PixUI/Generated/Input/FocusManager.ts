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
            (<PixUI.IFocusable><unknown>this.FocusedWidget).FocusNode.RaiseFocusChanged(false);
            this.FocusedWidget = null;
        }

        if (PixUI.IsInterfaceOfIFocusable(widget)) {
            this.FocusedWidget = widget;
            (<PixUI.IFocusable><unknown>this.FocusedWidget).FocusNode.RaiseFocusChanged(true);
        }
    }

    public OnKeyDown(e: PixUI.KeyEvent) {
        //TODO:考虑FocusedWidget==null时且为Tab从根节点开始查找Focusable
        if (this.FocusedWidget == null) return;
        FocusManager.PropagateEvent<PixUI.KeyEvent>(this.FocusedWidget, e,
            (w, ke) => (<PixUI.IFocusable><unknown>w).FocusNode.RaiseKeyDown(ke));
        //如果是Tab键跳转至下一个Focused
        if (!e.IsHandled && e.KeyCode == PixUI.Keys.Tab) {
            let forward = !e.Shift;
            let found: Nullable<PixUI.Widget>;
            if (forward)
                found = FocusManager.FindFocusableForward(this.FocusedWidget.Parent!, this.FocusedWidget);
            else
                found = FocusManager.FindFocusableBackward(this.FocusedWidget.Parent!, this.FocusedWidget);
            if (found != null)
                this.Focus(found);
        }
    }

    public OnKeyUp(e: PixUI.KeyEvent) {
        if (this.FocusedWidget == null) return;
        FocusManager.PropagateEvent<PixUI.KeyEvent>(this.FocusedWidget, e,
            (w, ke) => (<PixUI.IFocusable><unknown>w).FocusNode.RaiseKeyUp(ke));
    }

    public OnTextInput(text: string) {
        (<PixUI.IFocusable><unknown>this.FocusedWidget!).FocusNode.RaiseTextInput(text);
    }

    private static PropagateEvent<T extends PixUI.PropagateEvent>(widget: Nullable<PixUI.Widget>, theEvent: T,
                                                                  handler: System.Action2<PixUI.Widget, T>) {
        while (true) {
            if (widget == null) return;

            if (PixUI.IsInterfaceOfIFocusable(widget)) {
                handler(widget, theEvent);
                if (theEvent.IsHandled) return;
            }

            widget = widget.Parent;
        }
    }

    private static FindFocusableForward(container: PixUI.Widget, start: Nullable<PixUI.Widget>): Nullable<PixUI.Widget> {
        //start == null 表示向下
        let found: Nullable<PixUI.Widget> = null;
        let hasStart = start == null;
        container.VisitChildren(c => {
            if (!hasStart) {
                if ((c === start))
                    hasStart = true;
            } else {
                if (PixUI.IsInterfaceOfIFocusable(c)) {
                    found = c;
                    return true;
                }

                let childFocused = FocusManager.FindFocusableForward(c, null);
                if (childFocused != null) {
                    found = childFocused;
                    return true;
                }
            }

            return false;
        });

        if (found != null || start == null) return found;
        //继续向上
        if (container.Parent != null && !(PixUI.IsInterfaceOfIRootWidget(container.Parent)))
            return FocusManager.FindFocusableForward(container.Parent!, container);
        return null;
    }

    private static FindFocusableBackward(container: PixUI.Widget, start: Nullable<PixUI.Widget>): Nullable<PixUI.Widget> {
        //start == null 表示向下
        let found: Nullable<PixUI.Widget> = null;
        container.VisitChildren(c => {
            if (start != null && (c === start))
                return true;

            if (PixUI.IsInterfaceOfIFocusable(c)) {
                found = c; //Do not break, continue
            } else {
                let childFocused = FocusManager.FindFocusableForward(c, null);
                if (childFocused != null) {
                    found = childFocused; //Do not break, continue
                }
            }

            return false;
        });

        if (found != null || start == null) return found;
        //继续向上
        if (container.Parent != null && !(PixUI.IsInterfaceOfIRootWidget(container.Parent)))
            return FocusManager.FindFocusableBackward(container.Parent!, container);
        return null;
    }
}

export class FocusManagerStack {
    public constructor() {
        this._stack.Add(new FocusManager()); // for UIWindow
    }

    private readonly _stack: System.List<FocusManager> = new System.List<FocusManager>();

    public Push(manager: FocusManager) {
        this._stack.Add(manager);
    }

    public Remove(manager: FocusManager) {
        if (manager == this._stack[0]) throw new System.NotSupportedException();
        this._stack.Remove(manager);
    }

    public Focus(widget: Nullable<PixUI.Widget>) {
        if (widget == null)
            return; //TODO:考虑取消最后一层的FocusedWidget

        let manager = this.GetFocusManagerByWidget(widget);
        manager.Focus(widget);
    }

    public OnKeyDown(e: PixUI.KeyEvent) {
        this.GetFocusManagerWithFocused().OnKeyDown(e);
    }

    public OnKeyUp(e: PixUI.KeyEvent) {
        this.GetFocusManagerWithFocused().OnKeyUp(e);
    }

    public OnTextInput(text: string) {
        this.GetFocusManagerWithFocused().OnTextInput(text);
    }

    public GetFocusManagerByWidget(widget: PixUI.Widget): FocusManager {
        let temp = widget;
        while (temp.Parent != null) {
            if (temp.Parent instanceof PixUI.Popup) {
                const popup = temp.Parent;
                return popup.FocusManager;
            }
            temp = temp.Parent;
        }

        return this._stack[0];
    }

    private GetFocusManagerWithFocused(): FocusManager {
        for (let i = this._stack.length - 1; i > 0; i--) {
            if (this._stack[i].FocusedWidget != null)
                return this._stack[i];
        }

        return this._stack[0];
    }
}
