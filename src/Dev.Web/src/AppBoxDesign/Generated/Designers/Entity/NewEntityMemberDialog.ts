import * as System from '@/System'
import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxClient from '@/AppBoxClient'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class NewEntityMemberDialog extends PixUI.Dialog {
    public constructor(modelNode: AppBoxDesign.ModelNodeVO) {
        super();
        this._modelNode = modelNode;
        this.Width = PixUI.State.op_Implicit_From(380);
        this.Height = PixUI.State.op_Implicit_From(280);
        this.Title.Value = "New Entity Member";
    }

    private static readonly MemberTypes: string[] = ["EntityField", "EntityRef", "EntitySet"];
    private static readonly FieldTypes: string[] = ["String", "Int", "Long", "Float", "Double"];

    private readonly _modelNode: AppBoxDesign.ModelNodeVO;
    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From('');
    private readonly _allowNull: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);
    private readonly _memberType: PixUI.State<string> = PixUI.State.op_Implicit_From(NewEntityMemberDialog.MemberTypes[0]);
    private readonly _fieldType: PixUI.State<string> = PixUI.State.op_Implicit_From(NewEntityMemberDialog.FieldTypes[0]);
    private readonly _entityRefTarget: PixUI.State<Nullable<AppBoxDesign.ModelNodeVO>> = new PixUI.Rx<Nullable<AppBoxDesign.ModelNodeVO>>(null);
    private readonly _entitySetTarget: PixUI.State<Nullable<AppBoxDesign.EntityMemberInfo>> = new PixUI.Rx<Nullable<AppBoxDesign.EntityMemberInfo>>(null);

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column().Init(
                    {
                        Children:
                            [
                                new PixUI.Form().Init(
                                    {
                                        LabelWidth: 100,
                                        Padding: PixUI.EdgeInsets.Only(5, 5, 5, 0),
                                        Children:
                                            [
                                                new PixUI.FormItem("Name:", new PixUI.Input(this._name)),
                                                new PixUI.FormItem("MemberType:", new PixUI.Select<string>(this._memberType!).Init(
                                                    {
                                                        Options: NewEntityMemberDialog.MemberTypes
                                                    }))
                                            ]
                                    }),
                                new PixUI.Conditional(this._memberType)
                                    .When(t => t == "EntityField", () => new PixUI.Form().Init(
                                        {
                                            LabelWidth: 100,
                                            Padding: PixUI.EdgeInsets.Only(5, 0, 5, 5),
                                            Children:
                                                [
                                                    new PixUI.FormItem("FieldType:",
                                                        new PixUI.Select<string>(this._fieldType!).Init({Options: NewEntityMemberDialog.FieldTypes})),
                                                    new PixUI.FormItem("AllowNull:", new PixUI.Checkbox(this._allowNull))
                                                ]
                                        }))
                                    .When(t => t == "EntityRef", () => new PixUI.Form().Init(
                                        {
                                            LabelWidth: 100,
                                            Padding: PixUI.EdgeInsets.Only(5, 0, 5, 5),
                                            Children:
                                                [
                                                    new PixUI.FormItem("Target:",
                                                        new PixUI.Select<AppBoxDesign.ModelNodeVO>(this._entityRefTarget).Init(
                                                            {
                                                                Options: AppBoxDesign.DesignStore.GetAllEntityNodes().ToArray()
                                                            })),
                                                    new PixUI.FormItem("AllowNull:", new PixUI.Checkbox(this._allowNull))
                                                ]
                                        }))
                                    .When(t => t == "EntitySet", () => new PixUI.Form().Init(
                                        {
                                            LabelWidth: 100,
                                            Padding: PixUI.EdgeInsets.Only(5, 0, 5, 5),
                                            Children:
                                                [
                                                    new PixUI.FormItem("Target:",
                                                        new PixUI.Select<AppBoxDesign.EntityMemberInfo>(this._entitySetTarget).Init(
                                                            {
                                                                OptionsAsyncGetter: AppBoxClient.Channel.Invoke<AppBoxDesign.EntityMemberInfo[]>(
                                                                    "sys.DesignService.GetAllEntityRefs",
                                                                    [this._modelNode.Id])!
                                                            }))
                                                ]
                                        }))
                            ]
                    })
            });
    }

    private GetMemberTypeValue(): number {
        switch (this._memberType.Value) {
            case "EntityField":
                return <number><unknown>AppBoxCore.EntityMemberType.EntityField;
            case "EntityRef":
                return <number><unknown>AppBoxCore.EntityMemberType.EntityRef;
            case "EntitySet":
                return <number><unknown>AppBoxCore.EntityMemberType.EntitySet;
            default:
                throw new System.Exception();
        }
    }

    private GetFieldTypeValue(): number {
        switch (this._fieldType.Value) {
            case "String":
                return <number><unknown>AppBoxCore.EntityFieldType.String;
            case "Int":
                return <number><unknown>AppBoxCore.EntityFieldType.Int;
            case "Long":
                return <number><unknown>AppBoxCore.EntityFieldType.Long;
            case "Float":
                return <number><unknown>AppBoxCore.EntityFieldType.Float;
            case "Double":
                return <number><unknown>AppBoxCore.EntityFieldType.Double;
            default:
                throw new System.NotImplementedException();
        }
    }

    private GetRefModelIds(): string[] {
        if (this._entityRefTarget.Value == null) return [];
        return [this._entityRefTarget.Value!.Id];
    }

    public GetArgs(): Nullable<any>[] {
        let memberType = this.GetMemberTypeValue();
        if (memberType == <number><unknown>AppBoxCore.EntityMemberType.EntityField)
            return [
                this._modelNode.Id, this._name.Value, memberType, this.GetFieldTypeValue(), this._allowNull.Value
            ];
        if (memberType == <number><unknown>AppBoxCore.EntityMemberType.EntityRef)
            return [
                //TODO:暂不支持聚合引用
                this._modelNode.Id, this._name.Value, memberType, this.GetRefModelIds(), this._allowNull.Value
            ];
        if (memberType == <number><unknown>AppBoxCore.EntityMemberType.EntitySet)
            return [
                this._modelNode.Id, this._name.Value, memberType, this._entitySetTarget.Value!.ModelId,
                this._entitySetTarget.Value!.MemberId
            ];

        throw new System.NotImplementedException();
    }
}