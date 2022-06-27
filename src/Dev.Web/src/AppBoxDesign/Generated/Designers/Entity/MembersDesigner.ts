import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class MembersDesigner extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Row().Init(
            {
                Children: [new PixUI.Expanded().Init(
                    {
                        Child: new PixUI.DataGrid<AppBoxDesign.EntityModelVO>(this._membersController),
                    }), new PixUI.Container().Init(
                    {
                        BgColor: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3)),
                        Width: PixUI.State.op_Implicit_From(280),
                    })
                ]
            });
    }

    private readonly _membersController: PixUI.DataGridController<AppBoxDesign.EntityModelVO> = new PixUI.DataGridController<AppBoxDesign.EntityModelVO>(new System.List<PixUI.DataGridColumn<AppBoxDesign.EntityModelVO>>().Init(
        [
            new PixUI.DataGridTextColumn<AppBoxDesign.EntityModelVO>("Name", v => v.Name, PixUI.ColumnWidth.Fixed(90)),
            new PixUI.DataGridTextColumn<AppBoxDesign.EntityModelVO>("Type", v => v.Name, PixUI.ColumnWidth.Fixed(90)),
            new PixUI.DataGridTextColumn<AppBoxDesign.EntityModelVO>("AllowNull", v => v.Name, PixUI.ColumnWidth.Fixed(90)),
            new PixUI.DataGridTextColumn<AppBoxDesign.EntityModelVO>("Comment", v => v.Name),
        ]));

    public Init(props: Partial<MembersDesigner>): MembersDesigner {
        Object.assign(this, props);
        return this;
    }
}
