import * as AppBoxClient from '@/AppBoxClient'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class PublishDialog extends PixUI.Dialog<boolean> {
    public constructor(overlay: PixUI.Overlay) {
        super(overlay);
        this.Width = PixUI.State.op_Implicit_From(400);
        this.Height = PixUI.State.op_Implicit_From(300);
        this.Title.Value = "Publish";
        this.OnClose = this._OnClose.bind(this);
    }

    private readonly _dataGridController: PixUI.DataGridController<AppBoxDesign.ChangedModel> = new PixUI.DataGridController<AppBoxDesign.ChangedModel>(new System.List<PixUI.DataGridColumn<AppBoxDesign.ChangedModel>>().Init(
        [
            new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelType", v => v.ModelType),
            new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelId", v => v.ModelId),
        ])
    );

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column(PixUI.HorizontalAlignment.Right, 20).Init(
                    {
                        Children: [new PixUI.Expanded().Init({Child: new PixUI.DataGrid<AppBoxDesign.ChangedModel>(this._dataGridController)}), new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Cancel")).Init({OnTap: _ => this.Close(true)}), new PixUI.Button(PixUI.State.op_Implicit_From("OK")).Init({OnTap: _ => this.Close(false)})]
                            })
                        ]
                    })
            });
    }

    protected OnMounted() {
        super.OnMounted();
        //开始加载变更项
        this.LoadChanges();
    }

    private async LoadChanges() {
        let res = await AppBoxClient.Channel.Invoke("sys.DesignService.GetPendingChanges");
        this._dataGridController.DataSource = new System.List<AppBoxDesign.ChangedModel>(<AppBoxDesign.ChangedModel[]><unknown>res);
    }

    protected GetResult(canceled: boolean): boolean {
        return canceled;
    }

    private _OnClose(canceled: boolean, result: boolean) {
        if (canceled) return;
    }

    public Init(props: Partial<PublishDialog>): PublishDialog {
        Object.assign(this, props);
        return this;
    }
}
