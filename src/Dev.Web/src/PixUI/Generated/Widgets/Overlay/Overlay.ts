import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Overlay extends PixUI.Widget implements PixUI.IRootWidget {
    private static readonly $meta_PixUI_IRootWidget = true;

    public constructor(window: PixUI.UIWindow) {
        super();
        this.Window = window;
        this.IsMounted = true;
        this._children = new PixUI.WidgetList<PixUI.Widget>(this);
    }

    private readonly _children: PixUI.WidgetList<PixUI.Widget>;

    #Window: PixUI.UIWindow;
    public get Window() {
        return this.#Window;
    }

    private set Window(value) {
        this.#Window = value;
    }

    public get HasEntry(): boolean {
        return this._children.length > 0;
    }

    public FindEntry(predicate: System.Predicate<PixUI.Widget>): Nullable<PixUI.Widget> {
        return this._children.FirstOrDefault(entry => predicate(entry));
    }


    public Show(entry: PixUI.Widget) {
        if (this._children.Contains(entry)) return;

        this._children.Add(entry);
        entry.Layout(this.Window.Width, this.Window.Height);

        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public Remove(entry: PixUI.Widget) {
        if (!this._children.Remove(entry)) return;

        this.Invalidate(PixUI.InvalidAction.Repaint);
    }


    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        for (let i = this._children.length - 1; i >= 0; i--) //倒序
        {
            if (this.HitTestChild(this._children[i], x, y, result))
                break;
        }

        return result.IsHitAnyMouseRegion;
    }

    Layout(availableWidth: number, availableHeight: number) {
        //do nothing, children will layout on Show()
    }

    Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        for (const entry of this._children) {
            // if (entry.Widget.W <= 0 || entry.Widget.H <= 0)
            //     continue;

            let needTranslate = entry.X != 0 || entry.Y != 0;
            if (needTranslate)
                canvas.translate(entry.X, entry.Y);
            entry.Paint(canvas, area);
            if (needTranslate)
                canvas.translate(-entry.X, -entry.Y);
        }
    }

}
