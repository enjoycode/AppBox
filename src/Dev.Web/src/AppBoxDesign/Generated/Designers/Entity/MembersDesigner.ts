import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MembersDesigner extends PixUI.View {
    public constructor(membersController: PixUI.DataGridController<AppBoxDesign.EntityMemberVO>) {
        super();
        this.Child = new PixUI.Row().Init(
            {
                Children: [new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.DataGrid<AppBoxDesign.EntityMemberVO>(membersController),
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
