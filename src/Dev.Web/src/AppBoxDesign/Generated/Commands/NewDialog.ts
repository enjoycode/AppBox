import * as PixUI from '@/PixUI'
/// <summary>
/// 通用的新建对话框(Application, Folder, 除Entity外的Model)
/// </summary>
export class NewDialog extends PixUI.Dialog<string> {
    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _type: string;

    public constructor(overlay: PixUI.Overlay, type: string) {
        super(overlay);
        this.Width = PixUI.State.op_Implicit_From(400);
        this.Height = PixUI.State.op_Implicit_From(300);
        this.Title.Value = `New ${type}`;
        this._type = type;
        this.OnClose = this._OnClose.bind(this);
    }

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column(PixUI.HorizontalAlignment.Right, 20).Init(
                    {
                        Children: [new PixUI.Input(this._name).Init({HintText: "Please input name"}), new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("OK")).Init({OnTap: _ => this.Close(false)}), new PixUI.Button(PixUI.State.op_Implicit_From("Cancel")).Init({OnTap: _ => this.Close(true)})]
                            })
                        ]
                    })
            });
    }

    protected GetResult(canceled: boolean): Nullable<string> {
        return canceled ? null : this._name.Value;
    }

    private _OnClose(canceled: boolean, result: Nullable<string>) {
        if (canceled) return;
    }

    public Init(props: Partial<NewDialog>): NewDialog {
        Object.assign(this, props);
        return this;
    }
}
