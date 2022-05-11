import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class DesignerPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Column().Init({
            DebugLabel: "DesignerPad",
            Children: [new PixUI.TabBar<AppBoxDesign.IDesignNode>(AppBoxDesign.DesignStore.DesignerController, DesignerPad.BuildTab, true).Init({
                Height: PixUI.State.op_Implicit_From(40),
                Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3))
            }), new PixUI.Expanded().Init({Child: new PixUI.TabBody<AppBoxDesign.IDesignNode>(AppBoxDesign.DesignStore.DesignerController, DesignerPad.BuildBody)}
            )]
        });
    }

    private static BuildTab(node: AppBoxDesign.IDesignNode, tab: PixUI.Tab) {
        let textColor = PixUI.RxComputed.Make1(tab.IsSelected, selected => selected ? PixUI.Theme.FocusedColor : PixUI.Colors.Black
        );
        let bgColor = PixUI.RxComputed.Make1(tab.IsSelected, selected => selected ? PixUI.Colors.White : new PixUI.Color(0xFFF3F3F3));

        tab.Child = new PixUI.Container().Init({
            Color: bgColor,
            Width: PixUI.State.op_Implicit_From(100),
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(10, 8, 0, 0)),
            Child: new PixUI.Text(PixUI.State.op_Implicit_From(node.Label)).Init({Color: textColor}
            )
        });
    }

    private static BuildBody(node: AppBoxDesign.IDesignNode): PixUI.Widget {
        return new PixUI.Container().Init({
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
            Color: PixUI.State.op_Implicit_From(PixUI.Colors.White),
            Child: new PixUI.Text(PixUI.State.op_Implicit_From(node.Label))
        });
    }

    public Init(props: Partial<DesignerPad>): DesignerPad {
        Object.assign(this, props);
        return this;
    }
}
