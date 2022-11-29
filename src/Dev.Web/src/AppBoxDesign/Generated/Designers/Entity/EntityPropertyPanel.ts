import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class RxEntityField extends PixUI.RxObject<AppBoxDesign.EntityFieldVO> {
    public constructor(target: Nullable<AppBoxDesign.EntityFieldVO>) {
        super();
        this._target = target;

        this.Name = new PixUI.RxProperty<string>(() => this.Target.Name);
        this.FieldType = new PixUI.RxProperty<AppBoxCore.EntityFieldType>(() => this.Target.FieldType);
        this.Comment = new PixUI.RxProperty<string>(() => this.Target.Comment ?? '', v => this.Target.Comment = v);
    }

    public readonly Name: PixUI.RxProperty<string>;
    public readonly FieldType: PixUI.RxProperty<AppBoxCore.EntityFieldType>;
    public readonly Comment: PixUI.RxProperty<string>;
}

/// <summary>
/// 实体模型的属性面板
/// </summary>
export class EntityPropertyPanel extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO, selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>) {
        super();
        this._entityModel = entityModel;
        this._selectedMember = this.Bind(selectedMember, PixUI.BindingOptions.None);
        this._rxEntityField = new RxEntityField(<Nullable<AppBoxDesign.EntityFieldVO>><unknown>this._selectedMember.Value);
        let isEntityField = this._selectedMember
            .AsStateOfBool(v => v != null && v.Type == AppBoxCore.EntityMemberType.EntityField);

        this.Child = new PixUI.Column(PixUI.HorizontalAlignment.Left).Init(
            {
                Children:
                    [
                        new PixUI.Text(PixUI.State.op_Implicit_From("Entity Properties:")).Init({FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)}),
                        new PixUI.Form().Init(
                            {
                                LabelWidth: EntityPropertyPanel._labelWidth,
                                Children:
                                    [
                                        new PixUI.FormItem("DataStoreKind:", new PixUI.Input(PixUI.State.op_Implicit_From("SqlStore")).Init({Readonly: PixUI.State.op_Implicit_From(true)})),
                                        new PixUI.FormItem("DataStoreName:", new PixUI.Input(PixUI.State.op_Implicit_From("Default")).Init({Readonly: PixUI.State.op_Implicit_From(true)})),
                                        new PixUI.FormItem("Comment:", new PixUI.Input(PixUI.State.op_Implicit_From(""))),
                                    ]
                            }),
                        new PixUI.IfConditional(isEntityField,
                            () => new PixUI.Text(PixUI.State.op_Implicit_From("EntityField Properties:")).Init({FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)})),
                        new PixUI.IfConditional(isEntityField, () => new PixUI.Form().Init(
                            {
                                LabelWidth: EntityPropertyPanel._labelWidth,
                                Children:
                                    [
                                        new PixUI.FormItem("Name:", new PixUI.Input(this._rxEntityField.Name)),
                                        new PixUI.FormItem("FieldType:",
                                            new PixUI.Input(this._rxEntityField.FieldType.AsStateOfString(v => AppBoxCore.EntityFieldType[v]))),
                                        new PixUI.FormItem("Comment:", new PixUI.Input(this._rxEntityField.Comment))
                                    ]
                            }))
                    ]
            });
    }

    private static readonly _labelWidth: number = 120;
    private readonly _entityModel: AppBoxDesign.EntityModelVO;
    private readonly _selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>;
    private readonly _rxEntityField: RxEntityField;

    public OnStateChanged(state: PixUI.StateBase, options: PixUI.BindingOptions) {
        if ((state === this._selectedMember)) {
            if (this._selectedMember.Value != null) {
                if (this._selectedMember.Value.Type == AppBoxCore.EntityMemberType.EntityField)
                    this._rxEntityField.Target = <AppBoxDesign.EntityFieldVO><unknown>this._selectedMember.Value;
            }

            return;
        }

        super.OnStateChanged(state, options);
    }
}