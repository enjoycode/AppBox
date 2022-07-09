import * as System from '@/System'
import * as PixUI from '@/PixUI'

export type PopupTransitionBuilder = (animation: PixUI.Animation<number>, child: PixUI.Widget, origin: Nullable<PixUI.Offset>) => PixUI.Widget;

export abstract class Popup extends PixUI.Widget implements PixUI.IEventHook {
    protected constructor(overlay: PixUI.Overlay) {
        super();
        this.Owner = overlay;
    }

    public readonly Owner: PixUI.Overlay;
    public readonly FocusManager: PixUI.FocusManager = new PixUI.FocusManager();

    protected get IsDialog(): boolean {
        return false;
    }

    private _transition: Nullable<PopupTransitionWrap>;
    private _proxy: Nullable<PopupProxy>;

    public get AnimationController(): Nullable<PixUI.AnimationController> {
        return this._transition?.AnimationController;
    }

    public static readonly DefaultTransitionBuilder: PopupTransitionBuilder = (animation, child, origin) => new ScaleYTransition(animation, origin).Init(
        {
            Child: child
        });

    public static readonly DialogTransitionBuilder: PopupTransitionBuilder = (animation, child, origin) => {
        let curve = new PixUI.CurvedAnimation(animation, PixUI.Curves.EaseInOutCubic);
        let offsetAnimation = new PixUI.OffsetTween(new PixUI.Offset(0, -0.1), new PixUI.Offset(0, 0)).Animate(curve);
        return new PixUI.SlideTransition(offsetAnimation).Init(
            {
                Child: child //new FadeTransition(curve) { Child = child }
            });
    };

    public UpdatePosition(x: number, y: number) {
        this.SetPosition(x, y);
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    public Show(relativeTo: Nullable<PixUI.Widget> = null, relativeOffset: Nullable<PixUI.Offset> = null, transitionBuilder: Nullable<PopupTransitionBuilder> = null) {
        let target: PixUI.Widget = this;

        //先计算显示位置
        let origin: Nullable<PixUI.Offset> = null;
        let winX = 0;
        let winY = 0;
        if (relativeTo != null) {
            let winPt = relativeTo.LocalToWindow(0, 0);
            let offsetX = relativeOffset?.Dx ?? 0;
            let offsetY = relativeOffset?.Dy ?? 0;

            this._proxy = new PopupProxy(this); //构建占位并计算布局
            target = this._proxy;
            let popupHeight = this.H;
            //暂简单支持向下或向上弹出
            if (winPt.Y + relativeTo.H + offsetY + popupHeight > this.Owner.Window.Height) {
                //向上弹出
                winX = winPt.X + offsetX;
                winY = winPt.Y - offsetY - popupHeight;
                origin = new PixUI.Offset(0, popupHeight);
            } else {
                //向下弹出
                winX = winPt.X + offsetX;
                winY = winPt.Y + relativeTo.H + offsetY;
                //origin = new Offset(0, 0);
            }
        }

        if (transitionBuilder != null) {
            this._proxy ??= new PopupProxy(this);
            this._transition =
                new PopupTransitionWrap(this.Owner, this.IsDialog, this._proxy, origin, transitionBuilder);
            this._transition.Forward();
            target = this._transition;
        }

        if (relativeTo != null)
            target.SetPosition(winX, winY);
        else if (this.IsDialog)
            target.SetPosition((this.Owner.Window.Width - this.W) / 2, (this.Owner.Window.Height - this.H) / 2);

        this.Owner.Window.EventHookManager.Add(this);
        this.Owner.Window.FocusManagerStack.Push(this.FocusManager);
        this.Owner.Show(target);
    }

    public Hide() {
        this.Owner.Window.EventHookManager.Remove(this);
        this.Owner.Window.FocusManagerStack.Remove(this.FocusManager);
        if (this._transition != null) {
            this._transition.Reverse();
        } else if (this._proxy != null) {
            this.Owner.Remove(this._proxy);
            this._proxy = null;
        } else {
            this.Owner.Remove(this);
        }
    }

    public PreviewEvent(type: PixUI.EventType, e: Nullable<any>): PixUI.EventPreviewResult {
        return PixUI.EventPreviewResult.NotProcessed;
    }
}

export class PopupTransitionWrap extends PixUI.SingleChildWidget {
    public constructor(overlay: PixUI.Overlay, isDialog: boolean, proxy: PopupProxy, origin: Nullable<PixUI.Offset>, transitionBuilder: PopupTransitionBuilder) {
        super();
        this._overlay = overlay;
        this._isDialog = isDialog;
        this.AnimationController = new PixUI.AnimationController(100);
        this.AnimationController.StatusChanged.Add(this.OnAnimationStateChanged, this);

        this.Child = transitionBuilder(this.AnimationController, proxy, origin);
    }

    public readonly AnimationController: PixUI.AnimationController;
    private readonly _overlay: PixUI.Overlay;
    private readonly _isDialog: boolean;

    public Forward() {
        this.AnimationController.Forward();
    }

    public Reverse() {
        this.AnimationController.Reverse();
    }

    private OnAnimationStateChanged(status: PixUI.AnimationStatus) {
        if (status == PixUI.AnimationStatus.Completed) {
            this._overlay.Window.RunNewHitTest(); //打开后强制重新HitTest,考虑优化
        } else if (status == PixUI.AnimationStatus.Dismissed) {
            this._overlay.Remove(this);
            this._overlay.Window.RunNewHitTest(); //关闭后强制重新HitTest,考虑优化
        }
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (this._isDialog) {
            //always hit dialog
            result.Add(this);
            this.HitTestChild(this.Child!, x, y, result);
            return true;
        }

        return super.HitTest(x, y, result);
    }

    public Dispose() {
        this.AnimationController.Dispose();
        super.Dispose();
    }

    public Init(props: Partial<PopupTransitionWrap>): PopupTransitionWrap {
        Object.assign(this, props);
        return this;
    }
}

/// <summary>
/// 相当于Popup的占位，布局时不用再计算Popup
/// </summary>
export class PopupProxy extends PixUI.Widget {
    public constructor(popup: Popup) {
        super();
        //直接布局方便计算显示位置，后续不用再计算
        popup.Layout(popup.Owner.Window.Width, popup.Owner.Window.Height);

        this._popup = popup;
        this._popup.Parent = this;
    }

    private readonly _popup: Popup;

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._popup);
    }

    public ContainsPoint(x: number, y: number): boolean {
        return this._popup.ContainsPoint(x, y);
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        return this._popup.HitTest(x, y, result);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //popup已经布局过,只需要设置自身大小等于popup的大小
        this.SetSize(this._popup.W, this._popup.H);
    }

    protected OnUnmounted() {
        this._popup.Parent = null;
        super.OnUnmounted();
    }

    public Init(props: Partial<PopupProxy>): PopupProxy {
        Object.assign(this, props);
        return this;
    }
}

export class ScaleYTransition extends PixUI.Transform //TODO: 整合
{
    public constructor(animation: PixUI.Animation<number>, origin: Nullable<PixUI.Offset> = null) {
        super(PixUI.Matrix4.CreateScale(1, <number><unknown>animation.Value, 1), origin);
        this._animation = animation;
        this._animation.ValueChanged.Add(this.OnAnimationValueChanged, this);
    }

    private readonly _animation: PixUI.Animation<number>;

    private OnAnimationValueChanged() {
        this.SetTransform(PixUI.Matrix4.CreateScale(1, <number><unknown>this._animation.Value, 1));
    }

    public Init(props: Partial<ScaleYTransition>): ScaleYTransition {
        Object.assign(this, props);
        return this;
    }
}
