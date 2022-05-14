import * as PixUI from '@/PixUI'
import * as System from '@/System'

export class HitTestResult {
    private readonly _path: System.List<HitTestEntry> = new System.List<HitTestEntry>();

    private _transform: PixUI.Matrix4 = PixUI.Matrix4.CreateIdentity();

    #LastHitWidget: Nullable<PixUI.Widget>;
    public get LastHitWidget() {
        return this.#LastHitWidget;
    }

    private set LastHitWidget(value) {
        this.#LastHitWidget = value;
    }

    public get IsHitAnyMouseRegion(): boolean {
        return this._path.length > 0;
    }

    public get IsHitAnyWidget(): boolean {
        return this.LastHitWidget != null;
    }

    public Add(widget: PixUI.Widget): boolean {
        if ((this.LastHitWidget === widget))
            return false; //排除在旧区域中重新HitTest引起的重复加入

        this.LastHitWidget = widget;
        this._transform.Translate(-widget.X, -widget.Y);
        if (widget.Parent != null) {
            let parent = widget.Parent!;
            if (PixUI.IsInterfaceOfIScrollable(parent)) //不要合并条件，Web暂不支持
            {
                const scrollable = parent;
                this._transform.Translate(scrollable.ScrollOffsetX, scrollable.ScrollOffsetY);
            }
        }

        let isOpaqueMouseRegion = false;
        if (PixUI.IsInterfaceOfIMouseRegion(widget)) {
            const mouseRegion = widget;
            this._path.Add(new HitTestEntry(mouseRegion, (this._transform).Clone()));
            isOpaqueMouseRegion = mouseRegion.MouseRegion.Opaque;
        }

        return isOpaqueMouseRegion;
    }

    public ConcatLastTransform(transform: PixUI.Matrix4) {
        this._transform.PreConcat(transform);
        if ((this.LastHitWidget === this.LastWidgetWithMouseRegion)) {
            this._path[this._path.length - 1] = new HitTestEntry(this.LastEntry!.Widget, (this._transform).Clone());
        }
    }

    public TranslateOnScroll(scrollable: PixUI.Widget, dx: number, dy: number, winX: number, winY: number): boolean {
        //如果scrollable就是LastHitWidget，不需要处理
        if ((this.LastHitWidget === scrollable))
            return true;

        //滚动时必定没有超出scrollable的范围
        this._transform.Translate(dx, dy);
        let transformed = PixUI.MatrixUtils.TransformPoint(this._transform, winX, winY);
        let contains = this.LastHitWidget!.ContainsPoint(transformed.Dx, transformed.Dy);
        if (contains) {
            //Translate路径内所有Scrollable的子级
            for (let i = this._path.length - 1; i >= 0; i--) {
                if (!scrollable.IsAnyParentOf(<PixUI.Widget><unknown>this._path[i].Widget))
                    break;
                this._path[i].Transform.Translate(dx, dy);
            }
        }

        return contains;
    }

    public get LastWidgetWithMouseRegion(): Nullable<PixUI.Widget> {
        return this._path.length == 0 ? null : <PixUI.Widget><unknown>this._path[this._path.length - 1].Widget;
    }

    public get LastEntry(): Nullable<HitTestEntry> {
        return this._path.length == 0 ? null : this._path[this._path.length - 1];
    }

    public StillInLastRegion(winX: number, winY: number): boolean {
        if (this.LastHitWidget == null) return false;

        let transformed = PixUI.MatrixUtils.TransformPoint(this._transform, winX, winY);
        let contains = this.LastHitWidget.ContainsPoint(transformed.Dx, transformed.Dy);
        if (!contains) return false;

        //如果上级是IScrollable，还需要判断是否已滚出上级区域
        let scrollableParent = this.LastHitWidget.Parent?.FindParent(w => PixUI.IsInterfaceOfIScrollable(w));
        if (scrollableParent == null) return true;

        let scrollableToWin = scrollableParent.LocalToWindow(0, 0);
        return scrollableParent.ContainsPoint(winX - scrollableToWin.X, winY - scrollableToWin.Y);
    }

    public HitTestInLastRegion(winX: number, winY: number) {
        let transformed = PixUI.MatrixUtils.TransformPoint(this._transform, winX, winY);
        let isOpaqueMouseRegion = false;
        if (PixUI.IsInterfaceOfIMouseRegion(this.LastHitWidget)) {
            const mouseRegion = this.LastHitWidget;
            isOpaqueMouseRegion = mouseRegion.MouseRegion.Opaque;
        }
        if (!isOpaqueMouseRegion)
            this.LastHitWidget!.HitTest(transformed.Dx, transformed.Dy, this);
    }

    public ExitAll() {
        for (let i = this._path.length - 1; i >= 0; i--) {
            this._path[i].Widget.MouseRegion.RaiseHoverChanged(false);
        }
    }

    public ExitOldRegion(newResult: HitTestResult) {
        if (!this.IsHitAnyMouseRegion) return;

        let exitTo = -1; //从后往前退出的区域 eg: 1->2->3 变为 1, exitTo=1 
        for (let i = 0; i < this._path.length; i++) {
            exitTo = i;
            if (newResult._path.length == i)
                break;
            if (!(this._path[i].Widget === newResult._path[i].Widget))
                break;
            if (i == this._path.length - 1) return; //两者相等
        }

        for (let i = this._path.length - 1; i >= exitTo; i--) {
            this._path[i].Widget.MouseRegion.RaiseHoverChanged(false);
        }
    }

    public EnterNewRegion(oldResult: HitTestResult) {
        if (!this.IsHitAnyMouseRegion) return;

        let enterFrom = -1; //从前往后进入的区域 eg: 1 变为 1->2, enterFrom=1
        for (let i = 0; i < this._path.length; i++) {
            enterFrom = i;
            if (oldResult._path.length == i)
                break;
            if (!(this._path[i].Widget === oldResult._path[i].Widget))
                break;
            if (i == this._path.length - 1) return; //两者相等
        }

        for (let i = enterFrom; i < this._path.length; i++) {
            this._path[i].Widget.MouseRegion.RaiseHoverChanged(true);
        }
    }

    public PropagatePointerEvent(e: PixUI.PointerEvent, handler: System.Action2<PixUI.MouseRegion, PixUI.PointerEvent>) {
        for (let i = this._path.length - 1; i >= 0; i--) {
            let transformed = PixUI.MatrixUtils.TransformPoint(this._path[i].Transform, e.X, e.Y);
            e.SetPoint(transformed.Dx, transformed.Dy);
            handler(this._path[i].Widget.MouseRegion, e);
            if (e.IsHandled)
                return; //Stop propagate
        }
    }

    public Reset() {
        this._path.Clear();
        this.LastHitWidget = null;
        this._transform = PixUI.Matrix4.CreateIdentity();
    }

    public CopyFrom(other: HitTestResult) {
        this._path.Clear();
        this._path.AddRange(other._path);
        this.LastHitWidget = other.LastHitWidget;
        this._transform = (other._transform).Clone();
    }

    public Init(props: Partial<HitTestResult>): HitTestResult {
        Object.assign(this, props);
        return this;
    }
}

export class HitTestEntry {
    public readonly Widget: PixUI.IMouseRegion;
    public readonly Transform: PixUI.Matrix4;

    public constructor(widget: PixUI.IMouseRegion, transform: PixUI.Matrix4) {
        this.Widget = widget;
        this.Transform = (transform).Clone();
    }

    public ContainsPoint(winX: number, winY: number): boolean {
        let transformedPosition = PixUI.MatrixUtils.TransformPoint(this.Transform, winX, winY);
        return (<PixUI.Widget><unknown>this.Widget).ContainsPoint(transformedPosition.Dx, transformedPosition.Dy);
    }

    public Clone(): HitTestEntry {
        return new HitTestEntry(this.Widget, (this.Transform).Clone());
    }
}
