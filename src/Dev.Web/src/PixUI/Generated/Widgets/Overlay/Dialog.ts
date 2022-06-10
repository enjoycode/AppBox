import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Dialog<T> extends PixUI.Popup {
    private _child: Nullable<PixUI.Card>;
    protected readonly Title: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    protected OnClose: Nullable<System.Action2<boolean, Nullable<T>>>;

    protected constructor(overlay: PixUI.Overlay, onClose: Nullable<System.Action2<boolean, Nullable<T>>> = null) {
        super(overlay);
        this.OnClose = onClose;
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
        if (this._child == null) {
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

        super.OnMounted();
    }

    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._child!);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this._child!.Layout(this.Width?.Value ?? availableWidth, this.Height?.Value ?? availableHeight);

        //设置child居中
        this._child.SetPosition((availableWidth - this._child.W) / 2, (availableHeight - this._child.H) / 2);

        //注意自身宽高无限
        this.SetSize(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }

}
