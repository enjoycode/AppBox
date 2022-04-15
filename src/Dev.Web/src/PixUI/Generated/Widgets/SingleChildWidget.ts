import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 具有单个子级的Widget
/// </summary>
export abstract class SingleChildWidget extends PixUI.Widget {
    private _child: Nullable<PixUI.Widget>;

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (this._child != null)
            action(this._child);
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

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        if (this.Child == null) {
            this.SetSize(width, height);
            return;
        }

        this.Child.Layout(width, height);
        this.Child.SetPosition(0, 0);
        this.SetSize(this.Child.W, this.Child.H);
    }
}
