import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Widget implements PixUI.IStateBindable, System.IDisposable {
    // 绑定的状态列表,目前仅用于dispose时解除绑定关系
    private _states: Nullable<System.List<PixUI.StateBase>>;

    public get IsOpaque(): boolean {
        return false;
    }

    public get Clipper(): Nullable<PixUI.IClipper> {
        return null;
    }

    public DebugLabel: Nullable<string>;

    public set Ref(value: PixUI.IWidgetRef) {
        value.SetWidget(this);
    }

    private _flag: number = 0;
    private static readonly MountedMask: number = 1;
    private static readonly HasLayoutMask: number = 2; //TODO:待实现自动判断是否需要重新布局后移除
    protected static readonly LayoutTightMask: number = 1 << 3;
    private static readonly SuspendingMountMask: number = 1 << 20;

    private SetFlagValue(value: boolean, mask: number) {
        if (value)
            this._flag |= mask;
        else
            this._flag &= ~(mask);
    }

    public get SuspendingMount(): boolean {
        return (this._flag & Widget.SuspendingMountMask) == Widget.SuspendingMountMask;
    }

    public set SuspendingMount(value: boolean) {
        this.SetFlagValue(value, Widget.SuspendingMountMask);
    }

    protected get HasLayout(): boolean {
        return (this._flag & Widget.HasLayoutMask) == Widget.HasLayoutMask;
    }

    protected set HasLayout(value: boolean) {
        this.SetFlagValue(value, Widget.HasLayoutMask);
    }

    public get IsLayoutTight(): boolean {
        return (this._flag & Widget.LayoutTightMask) == Widget.LayoutTightMask;
    }

    public set IsLayoutTight(value: boolean) {
        if (value == this.IsLayoutTight) return;
        this.SetFlagValue(value, Widget.LayoutTightMask);
        if (this.IsMounted)
            this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    public get IsMounted(): boolean {
        return (this._flag & Widget.MountedMask) == Widget.MountedMask;
    }

    protected set IsMounted(value: boolean) {
        if (value) {
            this._flag |= Widget.MountedMask;
            this.OnMounted();
        } else {
            this._flag &= ~(Widget.MountedMask);
            this.OnUnmounted();
        }
    }

    protected OnMounted() {
    }

    protected OnUnmounted() {
    }


    #X: number = 0;
    public get X() {
        return this.#X;
    }

    private set X(value) {
        this.#X = value;
    }

    #Y: number = 0;
    public get Y() {
        return this.#Y;
    }

    private set Y(value) {
        this.#Y = value;
    }

    #W: number = 0;
    public get W() {
        return this.#W;
    }

    private set W(value) {
        this.#W = value;
    }

    #H: number = 0;
    public get H() {
        return this.#H;
    }

    private set H(value) {
        this.#H = value;
    }

    public CachedAvailableWidth: number = NaN; //TODO:考虑移到有子级的内
    public CachedAvailableHeight: number = NaN;

    private _width: Nullable<PixUI.State<number>>;
    private _height: Nullable<PixUI.State<number>>;

    public get Width(): Nullable<PixUI.State<number>> {
        return this._width;
    }

    public set Width(value: Nullable<PixUI.State<number>>) {
        this._width = this.Rebind(this._width, value, PixUI.BindingOptions.AffectsLayout);
    }

    public get Height(): Nullable<PixUI.State<number>> {
        return this._height;
    }

    public set Height(value: Nullable<PixUI.State<number>>) {
        this._height = this.Rebind(this._height, value, PixUI.BindingOptions.AffectsLayout);
    }

    protected get AutoSize(): boolean {
        return this._width == null || this._height == null;
    }

    public SetPosition(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }

    protected SetSize(w: number, h: number) {
        this.W = w;
        this.H = h;
    }


    private _parent: Nullable<Widget>;

    public get Parent(): Nullable<Widget> {
        return this._parent;
    }

    public set Parent(value: Nullable<Widget>) {
        if (value == null && this._parent == null) return;
        if (PixUI.IsInterfaceOfIRootWidget(this) && value != null)
            throw new System.InvalidOperationException("Can't set parent for IRootWidget");
        if (this._parent != null && value != null && !this.SuspendingMount)
            throw new System.InvalidOperationException("Widget already has parent");
        if (this.SuspendingMount && value == null) return; //忽略移动过程中设上级为空

        // Don't do this: _parent?.Children.Remove(this);
        this._parent = value;

        // 自动挂载或取消挂载至WidgetTree
        if (this._parent == null) {
            this.Unmount();
        } else {
            if (this._parent.IsMounted) this.Mount();
        }
    }

    public get Root(): Nullable<PixUI.IRootWidget> {
        if (this._parent != null)
            return this._parent.Root;
        if (PixUI.IsInterfaceOfIRootWidget(this)) {
            const root = this;
            return root;
        }
        return null;
    }

    public get CurrentNavigator(): Nullable<PixUI.Navigator> {
        let routeView = this.FindParent(w => w instanceof PixUI.RouteView);
        if (routeView == null) return null;
        return (<PixUI.RouteView><unknown>routeView).Navigator;
    }

    public VisitChildren(action: System.Func2<Widget, boolean>) {
    }

    public IndexOfChild(child: Widget): number {
        let index = -1;
        let found = -1;
        this.VisitChildren(item => {
            index++;
            if (!(item === child)) return false;
            found = index;
            return true;
        });
        return found;
    }

    public FindParent(predicate: System.Predicate<Widget>): Nullable<Widget> {
        return predicate(this) ? this : this._parent?.FindParent(predicate);
    }

    public IsAnyParentOf(child: Nullable<Widget>): boolean {
        if (child?.Parent == null) return false;
        return (child.Parent === this) || this.IsAnyParentOf(child.Parent);
    }


    public ContainsPoint(x: number, y: number): boolean {
        return x >= 0 && x < this.W && y >= 0 && y < this.H;
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        if (!this.ContainsPoint(x, y)) return false;

        //Console.WriteLine($"{this} HitTest: {x} {y}");

        if (result.Add(this))
            return true; //不再检测嵌套的子级

        this.VisitChildren(child => this.HitTestChild(child, x, y, result));

        return true;
    }

    protected HitTestChild(child: Widget, x: number, y: number, result: PixUI.HitTestResult): boolean {
        let scrollOffsetX = 0;
        let scrollOffsetY = 0;
        if (PixUI.IsInterfaceOfIScrollable(this)) {
            const scrollable = this;
            scrollOffsetX = scrollable.ScrollOffsetX;
            scrollOffsetY = scrollable.ScrollOffsetY;
        }

        let hit = child.HitTest(x - child.X + scrollOffsetX, y - child.Y + scrollOffsetY,
            result);
        return hit;
    }


    protected Compute1<T, TR>(s: PixUI.State<T>, getter: System.Func2<T, TR>): PixUI.RxComputed<TR> {
        return PixUI.RxComputed.Make1(s, getter);
    }

    protected Compute2<T1, T2, TR>(s1: PixUI.State<T1>, s2: PixUI.State<T2>,
                                   getter: System.Func3<T1, T2, TR>, setter: Nullable<System.Action1<TR>> = null): PixUI.RxComputed<TR> {
        return PixUI.RxComputed.Make2(s1, s2, getter, setter);
    }

    protected Bind<T extends PixUI.StateBase>(newState: T, options: PixUI.BindingOptions = PixUI.BindingOptions.AffectsVisual): T {
        return this.Rebind(null, newState, options)!;
    }

    protected Rebind<T extends PixUI.StateBase>(oldState: Nullable<T>, newState: Nullable<T>,
                                                options: PixUI.BindingOptions = PixUI.BindingOptions.AffectsVisual): Nullable<T> {
        oldState?.RemoveBinding(this);

        if (newState == null) return newState;

        newState.AddBinding(this, options);
        if (this._states == null) {
            this._states = new System.List<PixUI.StateBase>().Init([newState]);
        } else if (!this._states.Contains(newState)) {
            this._states.Add(newState);
        }

        return newState;
    }


    private Mount() {
        if (this.SuspendingMount) return;

        this.IsMounted = true;
        this.VisitChildren(child => {
            child.Mount();
            return false;
        });
    }

    private Unmount() {
        if (this.SuspendingMount) return;

        this.IsMounted = false;
        this.VisitChildren(child => {
            child.Unmount();
            return false;
        });
    }

    public Layout(availableWidth: number, availableHeight: number) {
        let width = this.CacheAndCheckAssignWidth(availableWidth);
        let height = this.CacheAndCheckAssignHeight(availableHeight);

        let hasChildren = false;
        this.SetSize(0, 0);
        this.VisitChildren(child => {
            hasChildren = true;
            child.Layout(width, height);
            this.SetSize(Math.max(this.W, child.W), Math.max(this.H, child.H));
            return false;
        });

        if (!hasChildren)
            this.SetSize(width, height);
    }

    protected CacheAndCheckAssignWidth(availableWidth: number): number {
        this.CachedAvailableWidth = Math.max(0, availableWidth);
        return this.Width == null
            ? this.CachedAvailableWidth
            : Math.min(Math.max(0, this.Width.Value), this.CachedAvailableWidth);
    }

    protected CacheAndCheckAssignHeight(availableHeight: number): number {
        this.CachedAvailableHeight = Math.max(0, availableHeight);
        return this.Height == null
            ? this.CachedAvailableHeight
            : Math.min(Math.max(0, this.Height.Value), this.CachedAvailableHeight);
    }

    public OnChildSizeChanged(child: Widget,
                              dx: number, dy: number, affects: PixUI.AffectsByRelayout) {
        console.assert(this.AutoSize);

        let oldWidth = this.W;
        let oldHeight = this.H;

        //TODO:考虑避免重复layout，在这里传入参数表明由子级触发，无需再layout子级?
        this.Layout(this.CachedAvailableWidth, this.CachedAvailableHeight);
        this.TryNotifyParentIfSizeChanged(oldWidth, oldHeight, affects);
    }

    public TryNotifyParentIfSizeChanged(oldWidth: number, oldHeight: number,
                                        affects: PixUI.AffectsByRelayout) {
        let dx = this.W - oldWidth;
        let dy = this.H - oldHeight;
        if (dx != 0 || dy != 0) {
            affects.Widget = this;
            affects.OldX = this.X;
            affects.OldY = this.Y;
            affects.OldW = oldWidth;
            affects.OldH = oldHeight;
            if (this.Parent != null && this.Parent.AutoSize)
                this.Parent.OnChildSizeChanged(this, dx, dy, affects);
        }
    }

    public LocalToWindow(x: number, y: number): PixUI.Point {
        let temp: Nullable<Widget> = this;
        while (temp != null) {
            x += temp.X;
            y += temp.Y;
            //判断上级是否IScrollable,是则处理偏移量
            if (PixUI.IsInterfaceOfIScrollable(temp.Parent)) {
                const scrollable = temp.Parent;
                x -= scrollable.ScrollOffsetX;
                y -= scrollable.ScrollOffsetY;
            }
            //判断上级是否Transform,是则变换坐标
            else if (temp.Parent instanceof PixUI.Transform) {
                const transform = temp.Parent;
                let transformed = PixUI.MatrixUtils.TransformPoint(transform.EffectiveTransform, x, y);
                x = transformed.Dx;
                y = transformed.Dy;
            }

            temp = temp.Parent;
        }

        // Debug.Assert(this is IRootWidget);
        return new PixUI.Point(x, y);
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        this.PaintChildren(canvas, area);
    }

    protected PaintChildren(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        this.VisitChildren(child => {
            if (child.W <= 0 || child.H <= 0)
                return false;
            if (area != null && !area.IntersectsWith(child))
                return false; //脏区域与子组件没有相交部分，不用绘制

            let needTranslate = child.X != 0 || child.Y != 0;
            if (needTranslate)
                canvas.translate(child.X, child.Y);
            child.Paint(canvas, area?.ToChild(child));
            if (needTranslate)
                canvas.translate(-child.X, -child.Y);

            PixUI.PaintDebugger.PaintWidgetBorder(child, canvas);
            return false;
        });
    }


    public Invalidate(action: PixUI.InvalidAction, area: Nullable<PixUI.IDirtyArea> = null) {
        PixUI.InvalidQueue.Add(this, action, area);
    }

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if (options == PixUI.BindingOptions.AffectsLayout) {
            PixUI.InvalidQueue.Add(this, PixUI.InvalidAction.Relayout, null);
        } else if (options == PixUI.BindingOptions.AffectsVisual) {
            PixUI.InvalidQueue.Add(this, PixUI.InvalidAction.Repaint, null);
        }
    }


    public get Overlay(): Nullable<PixUI.Overlay> {
        return this.Root?.Window.Overlay;
    }


    private ClearBindings() {
        if (this._states == null) return;
        for (const state of this._states) {
            state.RemoveBinding(this);
        }

        this._states = null;
    }

    public Dispose() {
        this.ClearBindings();

        this.Parent = null;
    }

    public toString(): string {
        return `${this.constructor.name}[${this.DebugLabel ?? ''}]`;
    }
}
