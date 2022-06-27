import * as System from '@/System'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class EntityDesigner extends PixUI.View implements AppBoxDesign.IDesigner {
    public constructor(modelNode: AppBoxDesign.ModelNode) {
        super();
        this._modelNode = modelNode;

        this.Child = new PixUI.Column().Init(
            {
                Children: [EntityDesigner.BuildActionBar(), new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.Conditional<number>(this._activePad, [new PixUI.WhenBuilder<number>(t => t == 0, () => new AppBoxDesign.MembersDesigner(this._membersController))])
                    })]
            });
    }

    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _activePad: PixUI.State<number> = PixUI.State.op_Implicit_From(0);
    private _hasLoad: boolean = false;
    private _entityModel: Nullable<AppBoxDesign.EntityModelVO>;

    private readonly _membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO> = new PixUI.DataGridController<AppBoxDesign.EntityMemberVO>();

    private static BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                BgColor: PixUI.State.op_Implicit_From(PixUI.Colors.White),
                Height: PixUI.State.op_Implicit_From(40),
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(15, 8, 15, 8)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init(
                    {
                        Children: [new PixUI.Text(PixUI.State.op_Implicit_From("")).Init({Width: PixUI.State.op_Implicit_From(120)}), new PixUI.Button(PixUI.State.op_Implicit_From("Members")).Init({Width: PixUI.State.op_Implicit_From(75)}), new PixUI.Button(PixUI.State.op_Implicit_From("Options")).Init({Width: PixUI.State.op_Implicit_From(75)}), new PixUI.Button(PixUI.State.op_Implicit_From("Data")).Init({Width: PixUI.State.op_Implicit_From(75)})]
                    })
            });
    }

    protected OnMounted() {
        super.OnMounted();
        this.TryLoadEntityModel();
    }

    private async TryLoadEntityModel() {
        if (this._hasLoad) return;
        this._hasLoad = true;

        try {
            this._entityModel = <AppBoxDesign.EntityModelVO><unknown>await AppBoxClient.Channel.Invoke(
                "sys.DesignService.OpenEntityModel", [this._modelNode.Id]);
            this._membersController.DataSource = this._entityModel!.Members;
        } catch (e: any) {
            PixUI.Notification.Error("无法加载实体模型");
        }
    }

    public SaveAsync(): Promise<void> {
        throw new System.NotImplementedException();
    }

    public Init(props: Partial<EntityDesigner>): EntityDesigner {
        Object.assign(this, props);
        return this;
    }
}
