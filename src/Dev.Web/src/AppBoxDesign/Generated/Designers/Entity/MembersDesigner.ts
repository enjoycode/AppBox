import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MembersDesigner extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO, membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO>) {
        super();
        this._membersController = membersController;
        this._membersController.SelectionChanged.Add(this.OnSelectedMemberChanged, this);

        this.Child = new PixUI.Row().Init(
            {
                Children: [new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.DataGrid<AppBoxDesign.EntityMemberVO>(membersController).Init(
                            {
                                Columns: new System.List<PixUI.DataGridColumn<AppBoxDesign.EntityMemberVO>>().Init(
                                    [
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Name", v => v.Name, PixUI.ColumnWidth.Fixed(150)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Type", MembersDesigner.MemberTypeToString, PixUI.ColumnWidth.Fixed(200)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("AllowNull", v => v.AllowNull.toString(), PixUI.ColumnWidth.Fixed(90)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Comment", v => v.Comment ?? ''),
                                    ])
                            }),
                    }), new PixUI.Container().Init(
                    {
                        BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                        Width: PixUI.State.op_Implicit_From(280),
                        Child: new AppBoxDesign.EntityPropertyPanel(entityModel, this._selectedMember)
                    })
                ]
            });
    }

    private readonly _membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO>;
    private readonly _selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>> = new PixUI.Rx<Nullable<AppBoxDesign.EntityMemberVO>>(null);

    private OnSelectedMemberChanged() {
        this._selectedMember.Value = this._membersController.SelectedRows.length == 0
            ? null
            : this._membersController.SelectedRows[0];
    }

    private static MemberTypeToString(member: AppBoxDesign.EntityMemberVO): string {
        if (member.Type == AppBoxCore.EntityMemberType.DataField)
            return `${AppBoxCore.EntityMemberType[member.Type]} - ${AppBoxCore.DataFieldType[(<AppBoxDesign.EntityFieldVO><unknown>member).DataType]}`;
        //TODO: EntityRef and EntitySet attach target entity name
        return AppBoxCore.EntityMemberType[member.Type];
    }

    public Init(props: Partial<MembersDesigner>): MembersDesigner {
        Object.assign(this, props);
        return this;
    }
}
