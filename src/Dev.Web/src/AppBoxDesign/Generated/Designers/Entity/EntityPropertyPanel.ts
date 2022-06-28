import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class EntityPropertyPanel extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO, selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>) {
        super();
        this._entityModel = entityModel;
        this._selectedMember = selectedMember;

        this.Child = new PixUI.Column(PixUI.HorizontalAlignment.Left).Init(
            {
                Children: [new PixUI.Text(PixUI.State.op_Implicit_From("Entity Properties:")).Init({FontWeight: PixUI.State.op_Implicit_From(CanvasKit.FontWeight.Bold)}), new PixUI.Form().Init(
                    {
                        LabelWidth: 120,
                        Children: [new PixUI.FormItem("DataStoreKind:", new PixUI.Input(PixUI.State.op_Implicit_From("SqlStore")).Init({Readonly: PixUI.State.op_Implicit_From(true)})), new PixUI.FormItem("DataStoreName:", new PixUI.Input(PixUI.State.op_Implicit_From("Default")).Init({Readonly: PixUI.State.op_Implicit_From(true)}))
                        ]
                    })
                ]
            });
    }

    private readonly _entityModel: AppBoxDesign.EntityModelVO;
    private readonly _selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>;

    public Init(props: Partial<EntityPropertyPanel>): EntityPropertyPanel {
        Object.assign(this, props);
        return this;
    }
}