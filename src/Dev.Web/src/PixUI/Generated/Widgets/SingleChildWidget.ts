import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 具有单个子级的Widget
/// </summary>
export abstract class SingleChildWidget extends PixUI.Widget {
    public constructor() {
        super();
        this.IsLayoutTight = true;
    }

    private _child: Nullable<PixUI.Widget>;
    private _padding: Nullable<PixUI.State<PixUI.EdgeInsets>>;

    public get Padding(): Nullable<PixUI.State<PixUI.EdgeInsets>> {
        return this._padding;
    }

    public set Padding(value: Nullable<PixUI.State<PixUI.EdgeInsets>>) {
        this._padding = this.Rebind(this._padding, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get Child(): Nullable<PixUI.Widget> {
        return this._child;
    }

    public set Child(value: Nullable<PixUI.Widget>) {
        if (this._child != null)
            this._child.Parent = null;

        this._child = value;

        if (this._child != null)
            this._child.Parent = this;
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._child != null)
            action(this._child);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let padding = this._padding?.Value ?? PixUI.EdgeInsets.All(0);

        if (this.Child == null) {
            if (this.IsLayoutTight)
                this.SetSize(0, 0);
            else
                this.SetSize(width, height);
            return;
        }

        this.Child.Layout(width - padding.Left - padding.Right,
            height - padding.Top - padding.Bottom);
        this.Child.SetPosition(padding.Left, padding.Top);

        if (this.IsLayoutTight)
            this.SetSize(this.Child.W + padding.Left + padding.Right,
                this.Child.H + padding.Top + padding.Bottom);
        else
            this.SetSize(width, height);
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number,
                              affects: PixUI.AffectsByRelayout) {
        console.assert(this.AutoSize);

        if (!this.IsLayoutTight) return; //do nothing when not IsLayoutTight

        let oldWidth = this.W;
        let oldHeight = this.H;
        this.SetSize(oldWidth + dx, oldHeight + dy); //直接更新自己的大小

        this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
    }
}
