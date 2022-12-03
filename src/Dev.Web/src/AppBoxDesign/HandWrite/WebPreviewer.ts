import * as PixUI from '@/PixUI'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'

export class WebPreviewer extends PixUI.View {

    private readonly _controller: AppBoxDesign.PreviewController;

    public constructor(controller: AppBoxDesign.PreviewController) {
        super();
        controller.InvalidateAction = () => this.Run();
        this._controller = controller;
    }

    private async Run() {
        let v = Date.now().toString();
        const url = "/preview/view/" + AppBoxClient.Channel.SessionId + "/" + this._controller.ModelNode.Id + "?v=" + v;
        try {
            let module = await import(/* @vite-ignore */url);
            let previewMethod = module[this._controller.ModelNode.Label.Value]["Preview"];
            let widget: PixUI.Widget;
            if (previewMethod)
                widget = previewMethod();
            else
                widget = new module[this._controller.ModelNode.Label.Value];

            this.Child = new PixUI.Container().Init({Child: widget});
            this.Invalidate(PixUI.InvalidAction.Relayout);

            //Sync outline view
            this._controller.CurrentWidget = widget;
            this._controller.RefreshOutlineAction?.call(this);
        } catch (error) {
            console.warn("获取预览失败: ", error);
        }
    }

    protected OnMounted() {
        super.OnMounted();

        this.Run();
    }
}