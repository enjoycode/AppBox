import * as PixUI from '@/PixUI'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'

export class WebPreviewer extends PixUI.View {

    private readonly _modelNode: AppBoxDesign.ModelNode;

    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;
    }

    private async Run() {
        const url = "/preview/" + AppBoxClient.Channel.SessionId + "/" + this._modelNode.Id;
        let module = await import(/* @vite-ignore */url);
        let widget = new module[this._modelNode.Label];
        this.Child = new PixUI.Container().Init({Child: widget});
        this.Invalidate(PixUI.InvalidAction.Relayout);
    }

    protected OnMounted() {
        super.OnMounted();

        this.Run();
    }
}