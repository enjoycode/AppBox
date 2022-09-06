import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as PixUI from '@/PixUI'
/// <summary>
/// 通用的新建对话框(Application, Folder, 除Entity外的Model)
/// </summary>
export class NewDialog extends PixUI.Dialog {
    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From("");
    private readonly _type: string;

    public constructor(type: string) {
        super();
        this.Width = PixUI.State.op_Implicit_From(300);
        this.Height = PixUI.State.op_Implicit_From(180);
        this.Title.Value = `New ${type}`;
        this._type = type;
    }

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Input(this._name).Init({HintText: "Please input name"})
            });
    }

    protected OnClosing(canceled: boolean): boolean {
        if (!canceled && !System.IsNullOrEmpty(this._name.Value))
            this.CreateAsync();
        return super.OnClosing(canceled);
    }

    private async CreateAsync() {
        let selectedNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) return;

        let service = `sys.DesignService.New${this._type}`;
        if (this._type != "Application" && this._type != "Folder")
            service += "Model";
        let args = this._type == "Application"
            ? [this._name.Value] : [(Math.floor(selectedNode.Data.Type) & 0xFFFFFFFF), selectedNode.Data.Id, this._name.Value];

        let res = await AppBoxClient.Channel.Invoke<AppBoxDesign.NewNodeResult>(service, args);
        //根据返回结果同步添加新节点
        AppBoxDesign.DesignStore.OnNewNode(res!);
    }

    public Init(props: Partial<NewDialog>): NewDialog {
        Object.assign(this, props);
        return this;
    }
}
