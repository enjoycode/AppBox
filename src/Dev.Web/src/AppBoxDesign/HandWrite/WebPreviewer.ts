import * as PixUI from '@/PixUI'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'

export class WebPreviewer extends PixUI.View {

    private readonly _controller: AppBoxDesign.PreviewController;
    private _version = 0;

    public constructor(controller: AppBoxDesign.PreviewController) {
        super();
        controller.InvalidateAction = () => this.Run();
        this._controller = controller;
    }

    private async Run() {
        this._version++;
        const url = "/preview/" + AppBoxClient.Channel.SessionId + "/" + this._controller.ModelNode.Id + "?v=" + this._version;
        try {
            let module = await import(/* @vite-ignore */url);
            let widget = new module[this._controller.ModelNode.Label];
            this.Child = new PixUI.Container().Init({Child: widget});
            this.Invalidate(PixUI.InvalidAction.Relayout);
        } catch (error) {
            console.warn("获取预览失败");
        }
    }

    protected OnMounted() {
        super.OnMounted();

        this.Run();
    }
}