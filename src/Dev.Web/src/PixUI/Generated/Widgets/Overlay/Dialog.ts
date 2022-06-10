import * as System from '@/System'
import * as PixUI from '@/PixUI'

export abstract class Dialog<T> extends PixUI.Popup {
    private readonly _onClose: Nullable<System.Action2<boolean, Nullable<T>>>;
    private readonly _child: PixUI.Card;
    protected readonly Title: PixUI.State<string> = PixUI.State.op_Implicit_From("");

    protected constructor(overlay: PixUI.Overlay, onClose: Nullable<System.Action2<boolean, Nullable<T>>> = null) {
        super(overlay);
        this._onClose = onClose;

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
        this._onClose?.call(this, canceled, this.GetResult(canceled));
    }


    public VisitChildren(action: System.Func2<PixUI.Widget, boolean>) {
        action(this._child);
    }

    public Layout(availableWidth: number, availableHeight: number) {
        this._child.Layout(this.Width?.Value ?? availableWidth, this.Height?.Value ?? availableHeight);

        //设置child居中
        this._child.SetPosition((availableWidth - this._child.W) / 2, (availableHeight - this._child.H) / 2);

        //注意自身宽高无限
        this.SetSize(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }

}
