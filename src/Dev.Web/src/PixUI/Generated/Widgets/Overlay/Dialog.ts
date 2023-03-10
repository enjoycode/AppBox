import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Dialog extends PixUI.Popup {
    protected constructor(overlay: Nullable<PixUI.Overlay> = null) {
        super(overlay ?? PixUI.UIWindow.Current.Overlay);
        //注意不在这里构建WidgetTree,参照以下OnMounted时的说明
    }

    private _child: Nullable<PixUI.Card>;
    protected readonly Title: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private _closeDone: Nullable<System.TaskCompletionSource<boolean>>;

    get IsDialog(): boolean {
        return true;
    }


    private TryBuildChild() {
        if (this._child != null) return;

        this._child = new PixUI.Card().Init(
            {
                Elevation: PixUI.State.op_Implicit_From(20),
                Child: new PixUI.Column().Init(
                    {
                        Children:
                            [
                                this.BuildTitle(),
                                new PixUI.Expanded(this.BuildBody()),
                                this.BuildFooter()
                            ]
                    })
            });
        this._child.Parent = this;
    }

    private BuildTitle(): PixUI.Widget {
        return new PixUI.Row().Init(
            {
                Height: PixUI.State.op_Implicit_From(25),
                Children:
                    [
                        new PixUI.Container().Init({Width: PixUI.State.op_Implicit_From(35)}), //TODO: SizeBox
                        new PixUI.Expanded().Init(
                            {
                                Child: new PixUI.Center().Init({Child: new PixUI.Text(this.Title)})
                            }),
                        new PixUI.Button(null, PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Close)).Init(
                            {
                                Style: PixUI.ButtonStyle.Transparent,
                                OnTap: _ => this.Close(true),
                            }),
                    ]
            });
    }

    protected abstract BuildBody(): PixUI.Widget ;

    protected BuildFooter(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Height: PixUI.State.op_Implicit_From(PixUI.Button.DefaultHeight + 20 + 20),
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
                    {
                        Children:
                            [
                                new PixUI.Expanded(),
                                new PixUI.Button(PixUI.State.op_Implicit_From("Cancel")).Init({
                                    Width: PixUI.State.op_Implicit_From(80),
                                    OnTap: _ => this.Close(true)
                                }),
                                new PixUI.Button(PixUI.State.op_Implicit_From("OK")).Init({
                                    Width: PixUI.State.op_Implicit_From(80),
                                    OnTap: _ => this.Close(false)
                                })
                            ]
                    })
            });
    }


    public Show() {
        super.Show(null, null, PixUI.Popup.DialogTransitionBuilder);
    }

    public ShowAndWaitClose(): System.Task<boolean> {
        this.Show();
        this._closeDone = new System.TaskCompletionSource<boolean>();
        // @ts-ignore
        return this._closeDone.Task;
    }

    protected OnClosing(canceled: boolean): boolean {
        return false;
    }

    protected Close(canceled: boolean) {
        if (this.OnClosing(canceled)) return; //aborted

        this.Hide();
        this._closeDone?.SetResult(canceled);
    }


    OnMounted() {
        //由于转换为Web后，继承自Dialog构造的初始化顺序问题, 所以在这里构建WidgetTree
        // class SomeDialog extends Dialog<string> {
        //      private State<string> _someState = "Hello";
        //      constructor(overlay: Overlay) {
        //          super(overlay); //如果在这里构建WidgetTree,则_someState为undefined
        //      }
        // }
        this.TryBuildChild();
        super.OnMounted();
    }

    VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._child!);
    }

    ContainsPoint(x: number, y: number): boolean {
        return true;
    }

    HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        //always hit dialog
        result.Add(this);
        this.HitTestChild(this._child!, x, y, result);
        return true;
    }

    Layout(availableWidth: number, availableHeight: number) {
        this.TryBuildChild();
        this._child!.Layout(this.Width?.Value ?? availableWidth, this.Height?.Value ?? availableHeight);
        //不用设置_child位置,显示时设置自身位置，另外不能设置自身大小为无限，因为弹出动画需要
        this.SetSize(this._child.W, this._child.H);
    }

}
