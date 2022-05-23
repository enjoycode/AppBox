import * as PixUI from '@/PixUI'

export class OverlayEntry {
    public constructor(widget: PixUI.Widget) {
        this.Widget = widget;
    }

    public readonly Widget: PixUI.Widget;

    public Owner: Nullable<PixUI.Overlay>; //显示时缓存，防止动画关闭后找不到实例

    //TODO: property for can handle input events

    public Invalidate() {
        this.Owner?.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public UpdatePosition(x: number, y: number) {
        this.Widget.SetPosition(x, y);
        if (this.Widget.IsMounted)
            this.Invalidate();
    }

    public Remove() {
        this.Owner?.Remove(this);
    }

    public Init(props: Partial<OverlayEntry>): OverlayEntry {
        Object.assign(this, props);
        return this;
    }
}
