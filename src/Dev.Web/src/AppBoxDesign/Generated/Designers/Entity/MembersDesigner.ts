import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MembersDesigner extends PixUI.View {
    public constructor(membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO>) {
        super();
        this.Child = new PixUI.Row().Init(
            {
                Children: [new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.DataGrid<AppBoxDesign.EntityMemberVO>(membersController).Init(
                            {
                                Columns: new System.List<PixUI.DataGridColumn<AppBoxDesign.EntityMemberVO>>().Init(
                                    [
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Name", v => v.Name, PixUI.ColumnWidth.Fixed(150)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Type", v => AppBoxCore.EntityMemberType[v.Type], PixUI.ColumnWidth.Fixed(180)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("AllowNull", v => v.AllowNull.toString(), PixUI.ColumnWidth.Fixed(90)),
                                        new PixUI.DataGridTextColumn<AppBoxDesign.EntityMemberVO>("Comment", v => v.Comment ?? ''),
                                    ])
                            }),
                    }), new PixUI.Container().Init(
                    {
                        BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                        Width: PixUI.State.op_Implicit_From(280),
                    })
                ]
            });
    }

    public Init(props: Partial<MembersDesigner>): MembersDesigner {
        Object.assign(this, props);
        return this;
    }
}
