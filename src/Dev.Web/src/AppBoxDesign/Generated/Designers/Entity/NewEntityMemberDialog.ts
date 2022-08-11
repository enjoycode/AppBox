import * as PixUI from '@/PixUI'

export class NewEntityMemberDialog extends PixUI.Dialog<any> {
    public constructor(overlay: PixUI.Overlay) {
        super(overlay);
        this.Width = PixUI.State.op_Implicit_From(380);
        this.Height = PixUI.State.op_Implicit_From(280);
        this.Title.Value = "New Entity Member";
    }
    
    private static readonly MemberTypes: string[] = ["EntityField", "EntityRef", "EntitySet"];
    private static readonly FieldTypes: string[] = ["String", "Int", "Long", "Float", "Double"];

    private readonly _name: PixUI.State<string> = PixUI.State.op_Implicit_From('');
    private readonly _memberType: PixUI.State<string> = PixUI.State.op_Implicit_From(NewEntityMemberDialog.MemberTypes[0]);
    private readonly _fieldType: PixUI.State<string> = PixUI.State.op_Implicit_From(NewEntityMemberDialog.FieldTypes[0]);
    private readonly _allowNull: PixUI.State<boolean> = PixUI.State.op_Implicit_From(false);

    protected BuildBody(): PixUI.Widget {
        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(20)),
                Child: new PixUI.Column().Init(
                    {
                        Children: [new PixUI.Form().Init(
                            {
                                LabelWidth: 100,
                                Padding: PixUI.EdgeInsets.Only(5, 5, 5, 0),
                                Children: [new PixUI.FormItem("Name:", new PixUI.Input(this._name)), new PixUI.FormItem("MemberType:", new PixUI.Select<string>(this._memberType!).Init(
                                    {
                                        Options: NewEntityMemberDialog.MemberTypes
                                    }))
                                ]
                            }), new PixUI.Conditional(this._memberType)
                            .When(t => t == "EntityField", () => new PixUI.Form().Init(
                                {
                                    LabelWidth: 100,
                                    Padding: PixUI.EdgeInsets.Only(5, 0, 5, 5),
                                    Children: [new PixUI.FormItem("FieldType:", new PixUI.Select<string>(this._fieldType!).Init({Options: NewEntityMemberDialog.FieldTypes})), new PixUI.FormItem("AllowNull:", new PixUI.Checkbox(this._allowNull))
                                    ]
                                })
                            ), new PixUI.Row(PixUI.VerticalAlignment.Middle, 20).Init(
                            {
                                Children: [new PixUI.Button(PixUI.State.op_Implicit_From("Cancel")).Init({
                                    Width: PixUI.State.op_Implicit_From(65),
                                    OnTap: _ => this.Close(true)
                                }), new PixUI.Button(PixUI.State.op_Implicit_From("OK")).Init({
                                    Width: PixUI.State.op_Implicit_From(65),
                                    OnTap: _ => this.Close(false)
                                })]
                            })
                        ]
                    })
            });
    }

    protected GetResult(canceled: boolean): Nullable<any> {
        return null;
    }

    public Init(props: Partial<NewEntityMemberDialog>): NewEntityMemberDialog {
        Object.assign(this, props);
        return this;
    }
}