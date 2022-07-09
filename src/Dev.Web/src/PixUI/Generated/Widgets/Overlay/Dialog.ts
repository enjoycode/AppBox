import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Dialog<T> extends PixUI.Popup {
    protected constructor(overlay: PixUI.Overlay, onClose: Nullable<System.Action2<boolean, Nullable<T>>> = null) {
        super(overlay);
        this.OnClose = onClose;
    }

    private _child: Nullable<PixUI.Card>;
    protected readonly Title: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    protected OnClose: Nullable<System.Action2<boolean, Nullable<T>>>;

    protected get IsDialog(): boolean {
        return true;
    }

    private BuildTitle(): PixUI.Widget {
        return new PixUI.Row().Init(
            {
                Height: PixUI.State.op_Implicit_From(25),
                Children: [new PixUI.Container().Init({Width: PixUI.State.op_Implicit_From(35)}), new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.Center().Init({Child: new PixUI.Text(this.Title)})
                    }), new PixUI.Button(null, PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Close)).Init(
                    {
                        Style: PixUI.ButtonStyle.Transparent,
                        OnTap: _ => this.Close(true),
                    })]
            });
    }

    protected abstract BuildBody(): PixUI.Widget ;

    protected abstract GetResult(canceled: boolean): Nullable<T> ;

    public Show() {
        super.Show(null, null, PixUI.Popup.DialogTransitionBuilder);
    }

    public Close(canceled: boolean) {
        this.Hide();
        this.OnClose?.call(this, canceled, this.GetResult(canceled));
    }


    protected OnMounted() {
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

    private TryBuildChild() {
        if (this._child != null) return;

        this._child = new PixUI.Card().Init(
            {
                Elevation: PixUI.State.op_Implicit_From(20),
                Child: new PixUI.Column().Init(
                    {
                        Children: [this.BuildTitle(), this.BuildBody()]
                    })
            });
        this._child.Parent = this;
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._child!);
    }

    public ContainsPoint(x: number, y: number): boolean {
        return true;
    }

    public HitTest(x: number, y: number, result: PixUI.HitTestResult): boolean {
        //always hit dialog
        result.Add(this);
        this.HitTestChild(this._child!, x, y, result);
        return true;
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this.TryBuildChild();
        this._child!.Layout(this.Width?.Value ?? availableWidth, this.Height?.Value ?? availableHeight);
        //不用设置_child位置,显示时设置自身位置，另外不能设置自身大小为无限，因为弹出动画需要
        this.SetSize(this._child.W, this._child.H);
    }

}
