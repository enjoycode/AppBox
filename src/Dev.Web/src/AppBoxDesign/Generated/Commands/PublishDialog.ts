import * as System from '@/System'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class PublishDialog extends PixUI.Dialog {
    public constructor() {
        super();
        this.Width = PixUI.State.op_Implicit_From(400);
        this.Height = PixUI.State.op_Implicit_From(300);
        this.Title.Value = "Publish";
    }

    private readonly _dataGridController: PixUI.DataGridController<AppBoxDesign.ChangedModel> = new PixUI.DataGridController<AppBoxDesign.ChangedModel>();

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.DataGrid<AppBoxDesign.ChangedModel>(this._dataGridController).Init(
                    {
                        Columns:
                            [
                                new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelType",
                                    v => v.ModelType),
                                new PixUI.DataGridTextColumn<AppBoxDesign.ChangedModel>("ModelId", v => v.ModelId),
                            ]
                    })
            });
    }

    OnMounted() {
        super.OnMounted();
        //开始加载变更项
        this.LoadChanges();
    }

    private async LoadChanges() {
        try {
            let res = await AppBoxClient.Channel.Invoke<Nullable<AppBoxDesign.ChangedModel[]>>(
                "sys.DesignService.GetPendingChanges");
            if (res != null)
                this._dataGridController.DataSource = new System.List<AppBoxDesign.ChangedModel>(res);
        } catch (ex: any) {
            PixUI.Notification.Error(`加载模型变更失败:${ex.Message}`);
        }
    }

    protected OnClosing(canceled: boolean): boolean {
        if (!canceled) //TODO: check no items to publish
            PublishDialog.PublishAsync();
        return super.OnClosing(canceled);
    }

    private static async PublishAsync() {
        try {
            await AppBoxClient.Channel.Invoke("sys.DesignService.Publish",
                ["commit message"]);
            PixUI.Notification.Success("发布成功");
        } catch (ex: any) {
            PixUI.Notification.Error(`发布失败: ${ex.Message}`);
        }
    }
}
