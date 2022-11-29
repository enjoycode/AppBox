import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class EntityDesigner extends PixUI.View implements AppBoxDesign.IModelDesigner {
    private static readonly $meta_AppBoxDesign_IModelDesigner = true;

    public constructor(modelNode: AppBoxDesign.ModelNodeVO) {
        super();
        this.ModelNode = modelNode;
        this._selectedMember = this._membersController.ObserveCurrentRow();

        this.Child = new PixUI.Column().Init(
            {
                Children: [this.BuildActionBar(), new PixUI.Expanded().Init({Child: this.BuildBody()})]
            });
    }

    #ModelNode: AppBoxDesign.ModelNodeVO;
    public get ModelNode() {
        return this.#ModelNode;
    }

    private set ModelNode(value) {
        this.#ModelNode = value;
    }

    private readonly _activePad: PixUI.State<number> = PixUI.State.op_Implicit_From(0); //当前的设计面板
    private _entityModel: Nullable<AppBoxDesign.EntityModelVO>;

    private _pendingGoto: Nullable<AppBoxDesign.ReferenceVO>;

    private readonly _membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO> = new PixUI.DataGridController();
    private readonly _selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>;

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
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Add"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Add)).Init(
                                    {OnTap: this.OnAddMember.bind(this)}), new PixUI.Button(PixUI.State.op_Implicit_From("Remove"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Delete)).Init(
                                    {OnTap: this.OnDeleteMember.bind(this)}), new PixUI.Button(PixUI.State.op_Implicit_From("Rename"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Edit)).Init(
                                    {OnTap: this.OnRenameMember.bind(this)}), new PixUI.Button(PixUI.State.op_Implicit_From("Usages"), PixUI.State.op_Implicit_From(PixUI.Icons.Filled.Link)).Init(
                                    {OnTap: this.OnFindUsages.bind(this)})]
                            }))]
                    })
            });
    }

    private BuildBody(): PixUI.Widget {
        return new PixUI.FutureBuilder<Nullable<AppBoxDesign.EntityModelVO>>(AppBoxClient.Channel.Invoke<AppBoxDesign.EntityModelVO>("sys.DesignService.OpenEntityModel", [this.ModelNode.Id]), (model, ex) => {
                if (ex != null) {
                    PixUI.Notification.Error(`无法加载实体模型: ${ex}`);
                    return null;
                }

                this._entityModel = model;
                this._membersController.DataSource = this._entityModel!.Members
                    .Where(m => !m.IsForeignKeyMember) //暂不显示EntityRef的外键
                    .ToList();

                if (this._pendingGoto != null) {
                    this.GotoDefinitionInternal(this._pendingGoto);
                    this._pendingGoto = null;
                }

                return new PixUI.Conditional(this._activePad)
                    .When(t => t == 0, () => new AppBoxDesign.MembersDesigner(this._entityModel!, this._membersController, this._selectedMember))
                    .When(t => t == 1, () => new AppBoxDesign.SqlStoreOptionsDesigner(this._entityModel!, this.ModelNode.Id));
            }
        );
    }


    private async OnAddMember(e: PixUI.PointerEvent) {
        let dlg = new AppBoxDesign.NewEntityMemberDialog(this.ModelNode);
        let canceled = await dlg.ShowAndWaitClose();
        if (canceled) return;

        try {
            let members = await AppBoxClient.Channel.Invoke<AppBoxDesign.EntityMemberVO[]>(
                "sys.DesignService.NewEntityMember", dlg.GetArgs());
            for (const member of members!) {
                if (member.IsForeignKeyMember) {
                    this._entityModel!.Members.Add(member);
                    continue;
                }

                this._membersController.Add(member);
            }
        } catch (ex: any) {
            PixUI.Notification.Error(`新建实体成员错误: ${ex.Message}`);
        }
    }

    private async OnDeleteMember(e: PixUI.PointerEvent) {
        if (this._selectedMember.Value == null) return;

        let args = [this.ModelNode.Id, this._selectedMember.Value.Name];
        try {
            await AppBoxClient.Channel.Invoke("sys.DesignService.DeleteEntityMember", args);

            let member = this._selectedMember.Value!;
            if (member instanceof AppBoxDesign.EntityRefVO) {
                const entityRef = member;
                //如果EntityRef同步移除相关隐藏成员
                if (entityRef.IsAggregationRef) {
                    //TODO:移除聚合类型成员
                    throw new System.NotImplementedException();
                }

                for (const fkMemberId of entityRef.FKMemberIds) {
                    let fk = this._entityModel!.Members.First(m => m.Id == fkMemberId);
                    this._entityModel!.Members.Remove(fk);
                }
            }

            this._membersController.Remove(member);
        } catch (ex: any) {
            PixUI.Notification.Error(`Delete member error: ${ex.Message}`);
        }
    }

    private async OnRenameMember(e: PixUI.PointerEvent) {
        if (this._selectedMember.Value == null) return;

        let oldName = this._selectedMember.Value.Name;
        let target = `${this.ModelNode.Label}.${oldName}`;
        let dlg = new AppBoxDesign.RenameDialog(AppBoxCore.ModelReferenceType.EntityMember, target, this.ModelNode.Id, oldName);
        let canceled = await dlg.ShowAndWaitClose();
        if (canceled) return;

        //同步重命名的成员名称
        this._selectedMember.Value.Name = dlg.GetNewName();
        this._membersController.Refresh();
        this._selectedMember.NotifyValueChanged();
    }

    private async OnFindUsages(e: PixUI.PointerEvent) {
        if (this._selectedMember.Value == null) return;

        let args = [<number><unknown>AppBoxCore.ModelReferenceType.EntityMember, this.ModelNode.Id, this._selectedMember.Value.Name];
        try {
            let res = await AppBoxClient.Channel.Invoke<System.IList<AppBoxDesign.ReferenceVO>>("sys.DesignService.FindUsages", args);
            AppBoxDesign.DesignStore.UpdateUsages(res!);
        } catch (ex: any) {
            PixUI.Notification.Error(`Delete member error: ${ex.Message}`);
        }
    }


    public GetOutlinePad(): Nullable<PixUI.Widget> {
        return null;
    }

    public GotoDefinition(reference: AppBoxDesign.ReferenceVO) {
        if (System.IsNullOrEmpty(reference.Location)) return; //不需要跳转

        if (this._entityModel == null)
            this._pendingGoto = reference;
        else
            this.GotoDefinitionInternal(reference);
    }

    private GotoDefinitionInternal(reference: AppBoxDesign.ReferenceVO) {
        //选中指定的成员
        let member = this._entityModel!.Members.FirstOrDefault(m => m.Name == reference.Location);
        this._selectedMember.Value = member;
    }

    public SaveAsync(): Promise<void> {
        return AppBoxClient.Channel.Invoke("sys.DesignService.SaveModel", [this.ModelNode.Id]);
    }

    public RefreshAsync(): Promise<void> {
        return Promise.resolve(); //TODO:
    }
}
