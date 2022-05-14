import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class UIWindow {
    protected constructor(child: PixUI.Widget) {
        this.FocusManager = new PixUI.FocusManager();
        this.EventHookManager = new PixUI.EventHookManager();
        this.Overlay = new PixUI.Overlay(this);
        this.RootWidget = new PixUI.Root(this, child);

        PixUI.PaintDebugger.EnableChanged.Add(() => this.RootWidget.Invalidate(PixUI.InvalidAction.Repaint));
    }


    public readonly RootWidget: PixUI.Root;

    public readonly FocusManager: PixUI.FocusManager;

    public readonly EventHookManager: PixUI.EventHookManager;

    public readonly Overlay: PixUI.Overlay;

    public BackgroundColor: PixUI.Color = PixUI.Colors.White; //TODO: move to Root

    public abstract get Width(): number;

    public abstract get Height(): number;

    public get ScaleFactor(): number {
        return 1.0;
    }

    public readonly WidgetsInvalidQueue: PixUI.InvalidQueue = new PixUI.InvalidQueue();
    public readonly OverlayInvalidQueue: PixUI.InvalidQueue = new PixUI.InvalidQueue();
    public HasPostInvalidateEvent: boolean = false;


    private _lastMouseX: number = -1;
    private _lastMouseY: number = -1;

    // Pointer.Move时检测命中的结果
    private _oldHitResult: PixUI.HitTestResult = new PixUI.HitTestResult();

    private _newHitResult: PixUI.HitTestResult = new PixUI.HitTestResult();

    // Pointer.Down时捕获的结果
    private _hitResultOnPointDown: Nullable<PixUI.HitTestEntry>;


    public abstract GetOnscreenCanvas(): PixUI.Canvas ;

    public abstract GetOffscreenCanvas(): PixUI.Canvas ;
    
    public abstract FlushOffscreenSurface(): void;
    
    public abstract DrawOffscreenSurface(): void;

    public OnFirstShow() {
        this.RootWidget.Layout(this.Width, this.Height);
        this.Overlay.Layout(this.Width, this.Height);

        let widgetsCanvas = this.GetOffscreenCanvas();
        widgetsCanvas.clear(this.BackgroundColor);
        this.RootWidget.Paint(widgetsCanvas);
        
        let overlayCanvas = this.GetOnscreenCanvas();
        this.FlushOffscreenSurface();
        this.DrawOffscreenSurface();

        //TODO: paint Overlay

        this.Present();
    }

    public abstract Present(): void;


    public OnPointerMove(e: PixUI.PointerEvent) {
        this._lastMouseX = e.X;
        this._lastMouseY = e.Y;

        if (this._oldHitResult.StillInLastRegion(e.X, e.Y)) {
            this.OldHitTest(e.X, e.Y); //仍在旧的命中范围内
        } else {
            this.NewHitTest(e.X, e.Y); //重新开始检测
        }

        //开始比较新旧命中结果，激发相应的HoverChanged事件
        this.CompareAndSwapHitTestResult();

        //如果命中MouseRegion，则向上传播事件(TODO: 考虑不传播)
        if (this._oldHitResult.IsHitAnyMouseRegion) {
            this._oldHitResult.PropagatePointerEvent(e, (w, e) => w.RaisePointerMove(e));
        }
    }

    public OnPointerMoveOutWindow() {
        this._lastMouseX = this._lastMouseY = -1;
        this.CompareAndSwapHitTestResult();
    }

    public OnPointerDown(pointerEvent: PixUI.PointerEvent) {
        if (this.EventHookManager.HookEvent(PixUI.EventType.PointerDown, pointerEvent))
            return;

        //TODO:移动端强制HitTest
        if (!this._oldHitResult.IsHitAnyWidget) {
            //TODO: overlay first
            this.RootWidget.HitTest(pointerEvent.X, pointerEvent.Y, this._oldHitResult);
        }

        if (!this._oldHitResult.IsHitAnyMouseRegion) return;

        this._hitResultOnPointDown = (this._oldHitResult.LastEntry)?.Clone();
        this._oldHitResult.PropagatePointerEvent(pointerEvent, (w, e) => w.RaisePointerDown(e));

        //Set focus widget after propagate event
        this.FocusManager.Focus(this._oldHitResult.LastHitWidget);
    }

    public OnPointerUp(pointerEvent: PixUI.PointerEvent) {
        if (!this._oldHitResult.IsHitAnyMouseRegion)
            return;

        //先尝试激发PointerTap事件
        if (this._hitResultOnPointDown != null) {
            if (this._hitResultOnPointDown.ContainsPoint(pointerEvent.X, pointerEvent.Y))
                this._hitResultOnPointDown.Widget.MouseRegion.RaisePointerTap(pointerEvent);
            this._hitResultOnPointDown = null;
        }

        this._oldHitResult.PropagatePointerEvent(pointerEvent, (w, e) => w.RaisePointerUp(e));
    }

    public OnScroll(scrollEvent: PixUI.ScrollEvent) {
        if (!this._oldHitResult.IsHitAnyWidget) return;

        let scrollable = this._oldHitResult.LastHitWidget!.FindParent(w => PixUI.IsInterfaceOfIScrollable(w));
        if (scrollable == null) return;

        (<PixUI.IScrollable><unknown>scrollable).OnScroll(scrollEvent.Dx, scrollEvent.Dy);

        //Translate HitTestResult and Rerun hit test.
        let stillInLastRegion = this._oldHitResult.TranslateOnScroll(scrollable, scrollEvent.Dx, scrollEvent.Dy, this._lastMouseX, this._lastMouseY);
        if (stillInLastRegion)
            this.OldHitTest(this._lastMouseX, this._lastMouseY);
        else
            this.NewHitTest(this._lastMouseX, this._lastMouseY);
        this.CompareAndSwapHitTestResult();
    }

    public OnKeyDown(keyEvent: PixUI.KeyEvent) {
        this.FocusManager.OnKeyDown(keyEvent);
    }

    public OnKeyUp(keyEvent: PixUI.KeyEvent) {
        this.FocusManager.OnKeyUp(keyEvent);
    }

    public OnTextInput(text: string) {
        this.FocusManager.OnTextInput(text);
    }


    private OldHitTest(winX: number, winY: number) {
        // Console.WriteLine($"========OldHitTest:({winX},{winY}) ========");
        let hitTestInOldRegion = true;
        if (this._oldHitResult.LastHitWidget!.Root instanceof PixUI.Root && this.Overlay.HasEntry) {
            //特殊情况，例如Popup与原Hit存在相交区域，还是得先尝试HitTest overlay
            this.Overlay.HitTest(winX, winY, this._newHitResult);
            if (this._newHitResult.IsHitAnyMouseRegion)
                hitTestInOldRegion = false;
        }

        if (hitTestInOldRegion) {
            this._newHitResult.CopyFrom(this._oldHitResult);
            this._newHitResult.HitTestInLastRegion(winX, winY);
        }
    }

    private NewHitTest(winX: number, winY: number) {
        console.log(`========NewHitTest:(${winX},${winY}) ========`);
        //先检测Overlay，没有命中再从RootWidget开始
        if (this.Overlay.HasEntry)
            this.Overlay.HitTest(winX, winY, this._newHitResult);
        if (!this._newHitResult.IsHitAnyMouseRegion)
            this.RootWidget.HitTest(winX, winY, this._newHitResult);
    }

    private CompareAndSwapHitTestResult() {
        this._oldHitResult.ExitOldRegion(this._newHitResult);
        this._newHitResult.EnterNewRegion(this._oldHitResult);

        if (this._oldHitResult.LastHitWidget != this._newHitResult.LastHitWidget) {
            console.log(`Hit: ${this._newHitResult.LastHitWidget} ${this._newHitResult.LastWidgetWithMouseRegion}`);
        }

        //重置并交换
        this._oldHitResult.Reset();
        let temp = this._oldHitResult;
        this._oldHitResult = this._newHitResult;
        this._newHitResult = temp;
    }

    public BeforeDynamicViewChange() {
        this.FocusManager.Focus(null);
    }

    public AfterDynamicViewChange(dynamicView: PixUI.DynamicView) {
        if (!this._oldHitResult.IsHitAnyWidget ||
            !(this._oldHitResult.LastHitWidget === dynamicView)) return;

        //切换过程结束后仍旧在DynamicView内，继续HitTest子级
        this.OldHitTest(this._lastMouseX, this._lastMouseY);
        this.CompareAndSwapHitTestResult();
    }

    public AfterLayoutChanged() {
        //始终重新开始检测，因为旧的命中的位置可能已改变
        this.NewHitTest(this._lastMouseX, this._lastMouseY);
        this.CompareAndSwapHitTestResult();
    }


    public StartTextInput() {
    }

    public SetTextInputRect(rect: PixUI.Rect) {
    }

    public StopTextInput() {
    }

}
