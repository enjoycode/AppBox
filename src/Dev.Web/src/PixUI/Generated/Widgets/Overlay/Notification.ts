import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class NotificationEntry extends PixUI.SingleChildWidget {
    private readonly _controller: PixUI.AnimationController = new PixUI.AnimationController(100);

    public constructor(icon: PixUI.Icon, text: PixUI.Text) {
        super();
        this._controller.ValueChanged.Add(this.OnAnimationValueChanged, this);
        this._controller.StatusChanged.Add(this.OnAnimationStateChanged, this);

        this.Child = new PixUI.Card().Init(
            {
                Width: PixUI.State.op_Implicit_From(280),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 5).Init(
                    {
                        Children: [icon, new PixUI.Expanded().Init({Child: text}), new PixUI.Button(null, PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Close)).Init(
                            {
                                Style: PixUI.ButtonStyle.Transparent,
                                Shape: PixUI.ButtonShape.Pills,
                                OnTap: _ => this._controller.Reverse()
                            })
                        ]
                    })
            });
    }

    private OnAnimationValueChanged() {
        let offsetX = this.Overlay!.Window.Width - this.W * this._controller.Value;
        this.SetPosition(<number><unknown>offsetX, this.Y);
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }

    private OnAnimationStateChanged(status: PixUI.AnimationStatus) {
        if (status == PixUI.AnimationStatus.Completed)
            this.StartHide();
        else if (status == PixUI.AnimationStatus.Dismissed)
            (<Notification><unknown>this.Parent!).RemoveEntry(this);
    }

    private async StartHide() {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 3000));
        this._controller.Reverse();
    }

    public StartShow() {
        this._controller.Forward();
    }

    public Dispose() {
        this._controller.Dispose();
        super.Dispose();
    }
}

export class Notification extends PixUI.Popup {
    private static readonly _firstOffset: number = 10;
    private static readonly _sepSpace: number = 2;

    private constructor(overlay: PixUI.Overlay) {
        super(overlay);
    }

    private readonly _children: System.IList<NotificationEntry> = new System.List<NotificationEntry>();

    public RemoveEntry(entry: NotificationEntry) {
        let index = this._children.IndexOf(entry);
        let entryHeight = entry.H;
        for (let i = index + 1; i < this._children.length; i++) {
            this._children[i].SetPosition(this._children[i].X, this._children[i].Y - entryHeight);
        }

        this._children.RemoveAt(index);
        this.Invalidate(PixUI.InvalidAction.Repaint);
    }


    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        for (const child of this._children) {
            if (action(child)) break;
        }
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        for (const child of this._children) {
            if (this.HitTestChild(child, x, y, result)) return true;
        }

        return false;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        //do nothing,加入前已经手动布局过
    }

    public Paint(canvas: PixUI.Canvas, area: Nullable<PixUI.IDirtyArea> = null) {
        for (const child of this._children) {
            canvas.translate(child.X, child.Y);
            child.Paint(canvas, area);
            canvas.translate(-child.X, -child.Y);
        }
    }


    private static Show(icon: PixUI.Icon, text: PixUI.Text) {
        let win = PixUI.UIWindow.Current;
        let exists = win.Overlay.FindEntry(e => e instanceof Notification);
        let notification = exists == null
            ? new Notification(win.Overlay)
            : <Notification><unknown>exists;
        if (exists == null)
            notification.Show();

        let entry = new NotificationEntry(icon, text);
        entry.Parent = notification;
        //布局并设置位置
        entry.Layout(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
        let childrenCount = notification._children.length;
        let yPos = childrenCount == 0
            ? Notification._firstOffset
            : notification._children[childrenCount - 1].Y +
            notification._children[childrenCount - 1].H + Notification._sepSpace;
        entry.SetPosition(win.Width, yPos);
        notification._children.Add(entry);

        entry.StartShow();
    }

    public static Info(message: string) {
        let color: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.Gray);
        Notification.Show(new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Info)).Init({
            Size: PixUI.State.op_Implicit_From(18),
            Color: color
        }), new PixUI.Text(PixUI.State.op_Implicit_From(message)).Init({TextColor: color, MaxLines: 5}));
    }

    public static Success(message: string) {
        let color: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.Green);
        Notification.Show(new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Error)).Init({
            Size: PixUI.State.op_Implicit_From(18),
            Color: color
        }), new PixUI.Text(PixUI.State.op_Implicit_From(message)).Init({TextColor: color, MaxLines: 5}));
    }

    public static Error(message: string) {
        let color: PixUI.State<PixUI.Color> = PixUI.State.op_Implicit_From(PixUI.Colors.Red);
        Notification.Show(new PixUI.Icon(PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Error)).Init({
            Size: PixUI.State.op_Implicit_From(18),
            Color: color
        }), new PixUI.Text(PixUI.State.op_Implicit_From(message)).Init({TextColor: color, MaxLines: 5}));
    }

}
