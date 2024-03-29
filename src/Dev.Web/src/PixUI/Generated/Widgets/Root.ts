import * as PixUI from '@/PixUI'

export class Root extends PixUI.SingleChildWidget implements PixUI.IRootWidget {
    private static readonly $meta_PixUI_IRootWidget = true;
    #Window: PixUI.UIWindow;
    public get Window() {
        return this.#Window;
    }

    private set Window(value) {
        this.#Window = value;
    }

    public constructor(window: PixUI.UIWindow, child: PixUI.Widget) {
        super();
        this.Window = window;
        // set IsMounted flag before set child
        this.IsMounted = true;
        this.Child = child;
    }

    Layout(availableWidth: number, availableHeight: number) {
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;
        this.SetPosition(0, 0);
        this.SetSize(availableWidth, availableHeight);
        this.Child!.Layout(this.W, this.H);
    }

    OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number,
                       affects: PixUI.AffectsByRelayout) {
        //do nothing
    }
}
