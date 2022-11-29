import * as AppBoxCore from '@/AppBoxCore'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MembersDesigner extends PixUI.View {
    public constructor(entityModel: AppBoxDesign.EntityModelVO,
                       membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO>,
                       selectedMember: PixUI.State<Nullable<AppBoxDesign.EntityMemberVO>>) {
        super();
        this.Child = new PixUI.Row().Init(
            {
                Children:
                    [
                        new PixUI.Expanded().Init(
                            {
                                Child: new PixUI.DataGrid<AppBoxDesign.EntityMemberVO>(membersController).Init(
                                    {
                                        Columns:
                                            [
                                                new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Name", v => v.Name).Init(
                                                    {Width: PixUI.ColumnWidth.Fixed(150)}),
                                                new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Type", MembersDesigner.MemberTypeToString).Init(
                                                    {Width: PixUI.ColumnWidth.Fixed(200)}),
                                                new PixUI.DataGridCheckboxColumn<AppBoxDesign.EntityMemberVO>("AllowNull",
                                                    v => v.AllowNull).Init(
                                                    {Width: PixUI.ColumnWidth.Fixed(90)}),
                                                new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Comment",
                                                    v => v.Comment ?? ''),
                                            ]
                                    }),
                            }),
                        new PixUI.Container().Init(
                            {
                                BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                                Width: PixUI.State.op_Implicit_From(280),
                                Child: new AppBoxDesign.EntityPropertyPanel(entityModel, selectedMember)
                            })
                    ]
            });
    }

    private static MemberTypeToString(member: AppBoxDesign.EntityMemberVO): string {
        if (member.Type == AppBoxCore.EntityMemberType.EntityField)
            return `${AppBoxCore.EntityMemberType[member.Type]} - ${AppBoxCore.EntityFieldType[(<AppBoxDesign.EntityFieldVO><unknown>member).FieldType]}`;
        //TODO: EntityRef and EntitySet attach target entity name
        return AppBoxCore.EntityMemberType[member.Type];
    }
}
