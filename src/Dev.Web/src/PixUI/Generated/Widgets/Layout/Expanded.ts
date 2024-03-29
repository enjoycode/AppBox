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

    Layout(availableWidth: number, availableHeight: number) {
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;

        if (this.Child != null) {
            this.Child.Layout(availableWidth, availableHeight);
            this.Child.SetPosition(0, 0);
        }

        let w = this.Parent instanceof PixUI.Column ? this.Child?.W ?? 0 : availableWidth;
        let h = this.Parent instanceof PixUI.Row ? this.Child?.H ?? 0 : availableHeight;
        this.SetSize(w, h);
    }

    OnChildSizeChanged(child: PixUI.Widget,
                       dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        let oldWidth = this.W;
        let oldHeight = this.H;
        let w = this.Parent instanceof PixUI.Column ? child.W : this.CachedAvailableWidth;
        let h = this.Parent instanceof PixUI.Row ? child.H : this.CachedAvailableHeight;
        this.SetSize(w, h);

        this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
    }
}
