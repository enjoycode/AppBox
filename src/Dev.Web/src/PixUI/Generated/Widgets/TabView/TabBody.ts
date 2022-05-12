import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabBody<T> extends PixUI.DynamicView {
    private readonly _controller: PixUI.TabController<T>;
    private readonly _bodyBuilder: System.Func2<T, PixUI.Widget>;
    private readonly _bodies: System.List<Nullable<PixUI.Widget>>;

    public constructor(controller: PixUI.TabController<T>, bodyBuilder: System.Func2<T, PixUI.Widget>) {
        super();
        this._controller = controller;
        this._controller.SetTabBody(this);
        this._bodyBuilder = bodyBuilder;

        this._bodies = new System.List<Nullable<PixUI.Widget>>([]);
        if (controller.DataSource.length > 0)
            this.Child = this.TryBuildBody();
    }

    private TryBuildBody(): PixUI.Widget {
        let selectedIndex = this._controller.SelectedIndex;
        if (this._bodies[selectedIndex] == null) {
            let selectedData = this._controller.DataSource[selectedIndex];
            this._bodies[selectedIndex] = this._bodyBuilder(selectedData);
        }

        return this._bodies[selectedIndex]!;
    }

    public OnAdd(dataItem: T) {
        this._bodies.Add(null);
    }

    public SwitchFrom(oldIndex: number) {
        let newIndex = this._controller.SelectedIndex;

        let from = this.Child;
        this.Child = null;
        let to = this.TryBuildBody();

        if (oldIndex < 0) {
            this.ReplaceTo(to);
        } else {
            this.AnimateTo(from, to, 200, false, (a, w) =>
                TabBody.BuildDefaultTransition(a, w, new PixUI.Offset(newIndex > oldIndex ? 1 : -1, 0), (PixUI.Offset.Zero).Clone()), (a, w) =>
                TabBody.BuildDefaultTransition(a, w, (PixUI.Offset.Zero).Clone(), new PixUI.Offset(newIndex > oldIndex ? -1 : 1, 0)));
        }
    }

    private static BuildDefaultTransition(animation: PixUI.Animation<number>, child: PixUI.Widget, fromOffset: PixUI.Offset, toOffset: PixUI.Offset): PixUI.Widget {
        let offsetAnimation = new PixUI.OffsetTween((fromOffset).Clone(), (toOffset).Clone()).Animate(animation);
        return new PixUI.SlideTransition(offsetAnimation).Init({Child: child});
    }

    public Init(props: Partial<TabBody<T>>): TabBody<T> {
        Object.assign(this, props);
        return this;
    }
}
