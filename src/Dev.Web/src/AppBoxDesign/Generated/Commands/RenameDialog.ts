import * as AppBoxDesign from '@/AppBoxDesign'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxCore from '@/AppBoxCore'
import * as PixUI from '@/PixUI'

export class RenameDialog extends PixUI.Dialog {
    public constructor(referenceType: AppBoxCore.ModelReferenceType, target: string, modelId: string, oldName: string) {
        super();
        this._referenceType = referenceType;
        this._target = PixUI.State.op_Implicit_From(target);
        this._modelId = modelId;
        this._oldName = PixUI.State.op_Implicit_From(oldName);

        this.Title.Value = this.GetTitile();
        this.Width = PixUI.State.op_Implicit_From(380);
        this.Height = PixUI.State.op_Implicit_From(240);
    }

    private readonly _referenceType: AppBoxCore.ModelReferenceType;
    private readonly _modelId: string;
    private readonly _target: PixUI.State<string>;
    private readonly _oldName: PixUI.State<string>;
    private readonly _newName: PixUI.State<string> = PixUI.State.op_Implicit_From("");

    private GetTitile(): string {
        switch (this._referenceType) {
            case AppBoxCore.ModelReferenceType.EntityModel:
                return "Rename Entity";
            case AppBoxCore.ModelReferenceType.EntityMember:
                return "Rename Entity Member";
            case AppBoxCore.ModelReferenceType.ServiceModel:
                return "Rename Service";
            case AppBoxCore.ModelReferenceType.ViewModel:
                return "Rename View";
            default:
                return "Rename";
        }
    }

    public GetNewName(): string {
        return this._newName.Value;
    }

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Form().Init(
                    {
                        LabelWidth: 100,
                        Children: [new PixUI.FormItem("Target:", new PixUI.Input(this._target).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("Old Name:", new PixUI.Input(this._oldName).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("New Name:", new PixUI.Input(this._newName))
                        ]
                    })
            });
    }

    protected OnClosing(canceled: boolean): boolean {
        if (!canceled)
            this.RenameAsync();
        return super.OnClosing(canceled);
    }

    private async RenameAsync() {
        try {
            let affects = await AppBoxClient.Channel.Invoke<string[]>("sys.DesignService.Rename", [(Math.floor(this._referenceType) & 0xFFFFFFFF), this._modelId, this._oldName.Value, this._newName.Value]);
            //通知刷新受影响的节点
            AppBoxDesign.DesignStore.OnRenameDone(this._referenceType, this._modelId, affects!);
            PixUI.Notification.Success("重命名成功");
        } catch (ex: any) {
            PixUI.Notification.Error(`重命名失败: ${ex.Message}`);
        }
    }

    public Init(props: Partial<RenameDialog>): RenameDialog {
        Object.assign(this, props);
        return this;
    }
}