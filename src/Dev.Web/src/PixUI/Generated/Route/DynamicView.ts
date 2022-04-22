import * as System from '@/System'
import * as PixUI from '@/PixUI'

export type TransitionBuilder = (animation: PixUI.Animation<number>, child: PixUI.Widget) => PixUI.Widget;

export class DynamicView extends PixUI.SingleChildWidget {
    private _animationController: Nullable<PixUI.AnimationController>;
    private _animationFrom: Nullable<PixUI.Widget>;
    private _animationTo: Nullable<PixUI.Widget>;
    private _transitionStack: Nullable<PixUI.TransitionStack>;

    protected ReplaceTo(to: PixUI.Widget) {
        this.Root!.Window.BeforeDynamicViewChange();
        this.Child = to;
        this.Root!.Window.AfterDynamicViewChange();
        this.Invalidate(PixUI.InvalidAction.Relayout); //这里始终重新布局
    }

    protected AnimateTo(from: PixUI.Widget, to: PixUI.Widget, duration: number, reverse: boolean, enteringBuilder: TransitionBuilder, existingBuilder: Nullable<TransitionBuilder>) {
        this._animationFrom = from;
        this._animationTo = to;

        this.Root!.Window.BeforeDynamicViewChange();

        this.CreateAnimationControl(duration, reverse);
        let exsiting = existingBuilder == null
            ? from
            : existingBuilder(this._animationController!, from);
        let entering = enteringBuilder(this._animationController!, to);

        this._transitionStack = new PixUI.TransitionStack(exsiting, entering);
        this.Child = this._transitionStack;

        this.Layout(this.CachedAvailableWidth, this.CachedAvailableHeight); //开始前强制重新布局
        if (reverse)
            this._animationController!.Reverse();
        else
            this._animationController!.Forward();
    }

    private CreateAnimationControl(duration: number, reverse: boolean) {
        let initValue = reverse ? 1 : 0;
        this._animationController = new PixUI.AnimationController(duration, initValue);
        this._animationController.ValueChanged.Add(this.OnAnimationValueChanged, this);
        this._animationController.StatusChanged.Add(this.OnAnimationStatusChanged, this);
    }

    private OnAnimationValueChanged() {
        this.Invalidate(PixUI.InvalidAction.Repaint); //这里仅重绘，因开始动画前已强制重新布局
    }

    private OnAnimationStatusChanged(status: PixUI.AnimationStatus) {
        if (status == PixUI.AnimationStatus.Completed || status == PixUI.AnimationStatus.Dismissed) {
            this._animationController!.ValueChanged.Remove(this.OnAnimationValueChanged, this);
            this._animationController.StatusChanged.Remove(this.OnAnimationStatusChanged, this);
            this._animationController.Dispose();
            this._animationController = null;

            //TODO:考虑使用MoveTo()以避免多余的Unmount/Mount
            this._animationTo!.Parent = null;
            this._animationFrom!.Parent = null;
            this.Child = status == PixUI.AnimationStatus.Completed ? this._animationTo : this._animationFrom;

            this._transitionStack!.Dispose();
            this._transitionStack = null;

            this.Root!.Window.AfterDynamicViewChange();
        }
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //始终填满可用空间
        this.CachedAvailableWidth = availableWidth;
        this.CachedAvailableHeight = availableHeight;

        this.Child?.Layout(availableWidth, availableHeight);
        this.SetSize(availableWidth, availableHeight);
    }

    public OnChildSizeChanged(child: PixUI.Widget, dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        //do nothing now.
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        //TODO:暂简单clip
        if (this.Parent != null) {
            canvas.save();
            canvas.clipRect(PixUI.Rect.FromLTWH(0, 0, this.W, this.H), CanvasKit.ClipOp.Intersect, false);
        }

        this.PaintChildren(canvas, area);

        if (this.Parent != null)
            canvas.restore();
    }

    public Init(props: Partial<DynamicView>): DynamicView {
        Object.assign(this, props);
        return this;
    }
}
