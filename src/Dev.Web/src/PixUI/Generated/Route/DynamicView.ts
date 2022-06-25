import * as PixUI from '@/PixUI'

export type TransitionBuilder = (animation: PixUI.Animation<number>, child: PixUI.Widget) => PixUI.Widget;

export abstract class DynamicView extends PixUI.SingleChildWidget {
    protected constructor() {
        super();
        this.IsLayoutTight = false; //默认非紧凑布局
    }

    private _animationController: Nullable<PixUI.AnimationController>;
    private _animationFrom: Nullable<PixUI.Widget>;
    private _animationTo: Nullable<PixUI.Widget>;
    private _transitionStack: Nullable<PixUI.TransitionStack>;

    protected ReplaceTo(to: Nullable<PixUI.Widget>) {
        this.Root!.Window.BeforeDynamicViewChange();
        this.Child = to;
        this.Root!.Window.AfterDynamicViewChange(this); //TODO: 检查是否需要，因重新布局会同样处理
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

            if (this._animationFrom!.SuspendingMount) {
                this._animationFrom.SuspendingMount = false;
                this._animationFrom.Parent = null;
                this._animationTo!.SuspendingMount = true;
            } else {
                this._animationTo!.SuspendingMount = false;
                this._animationTo.Parent = null;
                this._animationFrom.SuspendingMount = true;
            }

            this.Child = status == PixUI.AnimationStatus.Dismissed ? this._animationFrom : this._animationTo;

            if (this._animationTo!.SuspendingMount)
                this._animationTo.SuspendingMount = false;
            else
                this._animationFrom.SuspendingMount = false;

            this._transitionStack!.Dispose();
            this._transitionStack = null;

            this.Root!.Window.AfterDynamicViewChange(this);
        }
    }


    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        //如果在动画切换过程中，不继续尝试HitTest子级，因为缓存的HitTestResult.LastTransform如终是动画开始前的
        if (this._animationController != null &&
            this._animationController.Status != PixUI.AnimationStatus.Dismissed &&
            this._animationController.Status != PixUI.AnimationStatus.Completed) {
            if (!this.ContainsPoint(x, y)) return false;
            result.Add(this);
            return true;
        }

        return super.HitTest(x, y, result);
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

}
