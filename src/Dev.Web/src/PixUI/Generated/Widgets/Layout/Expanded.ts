import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Expanded extends PixUI.SingleChildWidget {
    #Flex: number = 1;
    public get Flex() {
        return this.#Flex;
    }

    private set Flex(value) {
        this.#Flex = value;
    }

    public constructor(child: Nullable<PixUI.Widget> = null, flex: number = 1) {
        super();
        this.Child = child;
        this.Flex = flex;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;

        if (this.Child != null) {
            this.Child.Layout(availableWidth, availableHeight);
            this.Child.SetPosition(0, 0);
        }

        let w = this.Parent instanceof PixUI.Column && this.Child != null ? this.Child.W : availableWidth;
        let h = this.Parent instanceof PixUI.Row && this.Child != null ? this.Child.H : availableHeight;
        this.SetSize(w, h);
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        let oldWidth = this.W;
        let oldHeight = this.H;
        let w = this.Parent instanceof PixUI.Column ? child.W : this.CachedAvailableWidth;
        let h = this.Parent instanceof PixUI.Row ? child.H : this.CachedAvailableHeight;
        this.SetSize(w, h);

        this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
    }

    public Init(props: Partial<Expanded>): Expanded {
        Object.assign(this, props);
        return this;
    }
}
