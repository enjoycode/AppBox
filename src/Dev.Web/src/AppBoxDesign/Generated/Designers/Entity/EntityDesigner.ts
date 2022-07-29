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
                Children: [this.BuildActionBar(), new PixUI.Expanded().Init(
                    {
                        //TODO: use FutureBuilder
                        Child: new PixUI.IfConditional(this._loaded, () => new PixUI.Conditional<number>(this._activePad, [new PixUI.WhenBuilder<number>(t => t == 0, () => new AppBoxDesign.MembersDesigner(this._entityModel!, this._membersController)), new PixUI.WhenBuilder<number>(t => t == 1, () => new AppBoxDesign.SqlStoreOptionsDesigner(this._entityModel!))
                        ]), null)
                    })]
            });
    }

    private readonly _modelNode: AppBoxDesign.ModelNode;
    private readonly _activePad: PixUI.State<number> = PixUI.State.op_Implicit_From(0); //当前的设计面板
    private _hasLoad: boolean = false;
    private readonly _loaded: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);
    private _entityModel: Nullable<AppBoxDesign.EntityModelVO>;

    private readonly _membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO> = new PixUI.DataGridController();

    private BuildActionBar(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF5F7FA)),
                Height: PixUI.State.op_Implicit_From(45),
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(8)),
                Child: new PixUI.Row(PixUI.VerticalAlignment.Middle, 10).Init(
                    {
                        Children: [new PixUI.ButtonGroup().Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Members")).Init(
                                    {
                                        Width: PixUI.State.op_Implicit_From(75),
                                        OnTap: _ => this._activePad.Value = 0
                                    }), new PixUI.Button(PixUI.State.op_Implicit_From("Options")).Init(
                                    {
                                        Width: PixUI.State.op_Implicit_From(75),
                                        OnTap: _ => this._activePad.Value = 1
                                    }), new PixUI.Button(PixUI.State.op_Implicit_From("Data")).Init({Width: PixUI.State.op_Implicit_From(75)})]
                            }), new PixUI.IfConditional(this._activePad.AsStateOfBool(i => i == 0), () => new PixUI.ButtonGroup().Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Add"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Add)), new PixUI.Button(PixUI.State.op_Implicit_From("Remove"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Delete)), new PixUI.Button(PixUI.State.op_Implicit_From("Rename"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Edit)), new PixUI.Button(PixUI.State.op_Implicit_From("Usages"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Link))]
                            }))]
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
            this._entityModel = await AppBoxClient.Channel.Invoke<AppBoxDesign.EntityModelVO>(
                "sys.DesignService.OpenEntityModel", [this._modelNode.Id]);
            this._membersController.DataSource = this._entityModel!.Members;
            this._loaded.Value = true;
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
