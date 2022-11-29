import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 用于动态视图切换动画
/// </summary>
export class TransitionStack extends PixUI.Widget {
    private readonly _from: PixUI.Widget;
    private readonly _to: PixUI.Widget;

    public constructor(from: PixUI.Widget, to: PixUI.Widget) {
        super();
        this._from = from;
        this._from.Parent = this;
        this._to = to;
        this._to.Parent = this;
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        if (!this.IsMounted) return;
        if (action(this._from)) return;
        action(this._to);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;
        this.SetSize(availableWidth, availableHeight);

        this._from.Layout(this.W, this.H);
        this._from.SetPosition(0, 0);
        this._to.Layout(this.W, this.H);
        this._to.SetPosition(0, 0);
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number,
                              affects: PixUI.AffectsByRelayout) {
        //do nothing
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        this._from.Paint(canvas, area);
        this._to.Paint(canvas, area);
    }
}
