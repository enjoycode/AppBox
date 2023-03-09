import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class TabBody<T> extends PixUI.DynamicView {
    private readonly _controller: PixUI.TabController<T>;
    private readonly _bodyBuilder: System.Func2<T, PixUI.Widget>;
    private readonly _bodies: System.List<Nullable<PixUI.Widget>>;

    public constructor(controller: PixUI.TabController<T>, bodyBuilder: System.Func2<T, PixUI.Widget>) {
        super();
        this._controller = controller;
        this._controller.BindTabBody(this);
        this._bodyBuilder = bodyBuilder;

        this._bodies = new System.List<Nullable<PixUI.Widget>>(new Array<PixUI.Widget>(this._controller.DataSource.length));
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

    public OnRemoveAt(index: number) {
        if (this._bodies[index] != null)
            this._bodies[index]!.Parent = null;
        this._bodies.RemoveAt(index);
    }

    public SwitchFrom(oldIndex: number) {
        let newIndex = this._controller.SelectedIndex;
        let to = this.TryBuildBody();

        if (oldIndex < 0) {
            this.ReplaceTo(to);
        } else {
            let from = this.Child;
            from!.SuspendingMount = true; //动画开始前挂起
            this.AnimateTo(from, to, 200, false,
                (a, w) =>
                    TabBody.BuildDefaultTransition(a, w, new PixUI.Offset(newIndex > oldIndex ? 1 : -1, 0),
                        PixUI.Offset.Empty),
                (a, w) =>
                    TabBody.BuildDefaultTransition(a, w, PixUI.Offset.Empty,
                        new PixUI.Offset(newIndex > oldIndex ? -1 : 1, 0)));
        }
    }

    public ClearBody() {
        this.ReplaceTo(null);
    }

    private static BuildDefaultTransition(animation: PixUI.Animation<number>, child: PixUI.Widget,
                                          fromOffset: PixUI.Offset, toOffset: PixUI.Offset): PixUI.Widget {
        let offsetAnimation = new PixUI.OffsetTween(fromOffset, toOffset).Animate(animation);
        return new PixUI.SlideTransition(offsetAnimation).Init({Child: child});
    }
}
