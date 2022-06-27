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
        this.OnClose = PublishDialog._OnClose;
    }

    private readonly _dataGridController: PixUI.DataGridController<AppBoxDesign.ChangedModel> = new PixUI.DataGridController<AppBoxDesign.ChangedModel>();

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column(PixUI.HorizontalAlignment.Right, 20).Init(
                    {
                        Children: [new PixUI.Expanded().Init(
                            {
                                Child: new PixUI.DataGrid<AppBoxDesign.ChangedModel>(this._dataGridController).Init(
                                    {
                                        Columns: new System.List<PixUI.DataGridColumn<AppBoxDesign.ChangedModel>>().Init(
                                            [
                                                new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelType", v => v.ModelType),
                                                new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelId", v => v.ModelId),
                                            ])
                                    })
                            }), new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
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
        try {
            let res = await AppBoxClient.Channel.Invoke("sys.DesignService.GetPendingChanges");
            this._dataGridController.DataSource = new System.List<AppBoxDesign.ChangedModel>(<AppBoxDesign.ChangedModel[]><unknown>res);
        } catch (e: any) {
            PixUI.Notification.Error("加载模型变更失败");
        }
    }

    protected GetResult(canceled: boolean): boolean {
        return canceled;
    }

    private static async _OnClose(canceled: boolean, result: boolean) {
        if (canceled) return;

        try {
            await AppBoxClient.Channel.Invoke("sys.DesignService.Publish", ["commit message"]);
            PixUI.Notification.Success("发布成功");
        } catch (e: any) {
            PixUI.Notification.Error("发布失败");
        }
    }

    public Init(props: Partial<PublishDialog>): PublishDialog {
        Object.assign(this, props);
        return this;
    }
}
