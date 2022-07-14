import * as System from '@/System'
import * as PixUI from '@/PixUI'

export interface IMouseRegion {
    get MouseRegion(): MouseRegion;

}

export function IsInterfaceOfIMouseRegion(obj: any): obj is IMouseRegion {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_PixUI_IMouseRegion' in obj.constructor;
}

export class MouseRegion {
    public readonly Cursor: Nullable<System.Func1<PixUI.Cursor>>;

    public readonly Opaque: boolean;

    public readonly PointerDown = new System.Event<PixUI.PointerEvent>();
    public readonly PointerUp = new System.Event<PixUI.PointerEvent>();
    public readonly PointerMove = new System.Event<PixUI.PointerEvent>();
    public readonly PointerTap = new System.Event<PixUI.PointerEvent>();
    public readonly HoverChanged = new System.Event<boolean>();

    public constructor(cursor: Nullable<System.Func1<PixUI.Cursor>> = null, opaque: boolean = true) {
        this.Cursor = cursor;
        this.Opaque = opaque;
    }

    public RaisePointerMove(theEvent: PixUI.PointerEvent) {
        this.PointerMove.Invoke(theEvent);
    }

    public RaisePointerDown(theEvent: PixUI.PointerEvent) {
        this.PointerDown.Invoke(theEvent);
    }

    public RaisePointerUp(theEvent: PixUI.PointerEvent) {
        this.PointerUp.Invoke(theEvent);
    }

    public RaisePointerTap(theEvent: PixUI.PointerEvent) {
        this.PointerTap.Invoke(theEvent);
    }

    public RaiseHoverChanged(hover: boolean) {
        if (this.Cursor != null)
            PixUI.Cursor.Current = hover ? this.Cursor() : PixUI.Cursors.Arrow;
        this.HoverChanged.Invoke(hover);
    }

    public RestoreHoverCursor() {
        if (this.Cursor != null)
            PixUI.Cursor.Current = this.Cursor();
    }

    public Init(props: Partial<MouseRegion>): MouseRegion {
        Object.assign(this, props);
        return this;
    }
}
