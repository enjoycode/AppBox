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
        this.Child = this.TryBuildBody();
    }

    private TryBuildBody(): PixUI.Widget {
        let selectedIndex = this._controller.SelectedIndex;
        if (this._bodies[selectedIndex] == null) {
            let selectedData = this._controller.DataSource[selectedIndex];
            let body = this._bodyBuilder(selectedData);
            this._bodies[selectedIndex] = body;
        }

        return this._bodies[selectedIndex]!;
    }

    public SwitchTo(oldIndex: number) {
        let newIndex = this._controller.SelectedIndex;

        let from = this.Child;
        this.Child = null;
        let to = this.TryBuildBody();

        //ReplaceTo(to);

        this.AnimateTo(from, to, 200, false, (a, w) =>
            TabBody.BuildDefaultTransition(a, w, newIndex > oldIndex ? new PixUI.Offset(1, 0) : new PixUI.Offset(-1, 0), PixUI.Offset.Zero), (a, w) =>
            TabBody.BuildDefaultTransition(a, w, PixUI.Offset.Zero, newIndex > oldIndex ? new PixUI.Offset(-1, 0) : new PixUI.Offset(1, 0)));
    }

    private static BuildDefaultTransition(animation: PixUI.Animation<number>, child: PixUI.Widget, fromOffset: PixUI.Offset, toOffset: PixUI.Offset): PixUI.Widget {
        let offsetAnimation = new PixUI.OffsetTween(fromOffset, toOffset).Animate(animation);
        return new PixUI.SlideTransition(offsetAnimation).Init({Child: child});
    }

    public Init(props: Partial<TabBody<T>>): TabBody<T> {
        Object.assign(this, props);
        return this;
    }
}
