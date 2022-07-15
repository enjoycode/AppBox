import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class RxEntityField extends PixUI.RxObject<AppBoxDesign.EntityFieldVO> {
    public constructor() {
        super();
        this.Name = new PixUI.RxProperty<string>(() => this.Object.Name);
        this.DataType = new PixUI.RxProperty<AppBoxCore.DataFieldType>(() => this.Object.DataType);
        this.Comment = new PixUI.RxProperty<string>(() => this.Object.Comment ?? '', v => this.Object.Comment = v);
    }

    public readonly Name: PixUI.RxProperty<string>;
    public readonly DataType: PixUI.RxProperty<AppBoxCore.DataFieldType>;
    public readonly Comment: PixUI.RxProperty<string>;

    public Init(props: Partial<RxEntityField>): RxEntityField {
        Object.assign(this, props);
        return this;
    }

}

/// <summary>
/// 实体模型的属性面板
/// </summary>
export class EntityPropertyPanel extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO, selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>) {
        super();
        this._entityModel = entityModel;
        this._selectedMember = this.Bind(selectedMember, PixUI.BindingOptions.None);
        let isEntityField = this._selectedMember
            .AsStateOfBool(v => v != null && v.Type == AppBoxCore.EntityMemberType.DataField);

        this.Child = new PixUI.Column(PixUI.HorizontalAlignment.Left).Init(
            {
                Children: [new PixUI.Text(PixUI.State.op_Implicit_From("Entity Properties:")).Init({FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)}), new PixUI.Form().Init(
                    {
                        LabelWidth: this._labelWidth,
                        Children: [new PixUI.FormItem("DataStoreKind:", new PixUI.Input(PixUI.State.op_Implicit_From("SqlStore")).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("DataStoreName:", new PixUI.Input(PixUI.State.op_Implicit_From("Default")).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("Comment:", new PixUI.Input(PixUI.State.op_Implicit_From("")))]
                    }), new PixUI.IfConditional(isEntityField, () => new PixUI.Text(PixUI.State.op_Implicit_From("EntityField Properties:")).Init({FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)})), new PixUI.IfConditional(isEntityField, () => new PixUI.Form().Init(
                    {
                        LabelWidth: this._labelWidth,
                        Children: [new PixUI.FormItem("Name:", new PixUI.Input(this._rxEntityField.Name).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("DataType:", new PixUI.Input(this._rxEntityField.DataType.AsStateOfString(v => AppBoxCore.DataFieldType[v])).Init(
                            {Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("Comment:", new PixUI.Input(this._rxEntityField.Comment))
                        ]
                    }))
                ]
            });
    }

    private readonly _labelWidth: number = 120;
    private readonly _entityModel: AppBoxDesign.EntityModelVO;
    private readonly _selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>;
    private readonly _rxEntityField: RxEntityField = new RxEntityField();

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if ((state === this._selectedMember)) {
            if (this._selectedMember.Value != null) {
                if (this._selectedMember.Value.Type == AppBoxCore.EntityMemberType.DataField)
                    this._rxEntityField.Object = <AppBoxDesign.EntityFieldVO><unknown>this._selectedMember.Value;
            }

            return;
        }

        super.OnStateChanged(state, options);
    }

    public Init(props: Partial<EntityPropertyPanel>): EntityPropertyPanel {
        Object.assign(this, props);
        return this;
    }
}