import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class DesignerPad extends PixUI.View {
    public constructor() {
        super();
        AppBoxDesign.DesignStore.TreeController.SelectionChanged.Add(this.OnTreeSelectionChanged, this);

        this.Child = new PixUI.Column().Init({
            DebugLabel: "DesignerPad",
            Children: [new PixUI.TabBar<AppBoxDesign.DesignNode>(AppBoxDesign.DesignStore.DesignerController, DesignerPad.BuildTab, true).Init({
                Height: PixUI.State.op_Implicit_From(40),
                Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3))
            }), new PixUI.Expanded().Init({Child: new PixUI.TabBody<AppBoxDesign.DesignNode>(AppBoxDesign.DesignStore.DesignerController, DesignerPad.BuildBody)}
            )]
        });
    }

    private static BuildTab(node: AppBoxDesign.DesignNode, tab: PixUI.Tab) {
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

    private static BuildBody(node: AppBoxDesign.DesignNode): PixUI.Widget {
        return new PixUI.Container().Init({
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
            Color: PixUI.State.op_Implicit_From(PixUI.Colors.White),
            Child: new PixUI.Text(PixUI.State.op_Implicit_From(node.Label))
        });
    }

    private OnTreeSelectionChanged() {
        let currentNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (currentNode != null && currentNode.Data instanceof AppBoxDesign.ModelNode) {
            //先检查是否已经打开
            let existsIndex = AppBoxDesign.DesignStore.DesignerController.IndexOf(currentNode.Data);
            if (existsIndex < 0)
                AppBoxDesign.DesignStore.DesignerController.Add(currentNode.Data);
            else
                AppBoxDesign.DesignStore.DesignerController.SelectAt(existsIndex);
        }
    }

    public Init(props: Partial<DesignerPad>): DesignerPad {
        Object.assign(this, props);
        return this;
    }
}
