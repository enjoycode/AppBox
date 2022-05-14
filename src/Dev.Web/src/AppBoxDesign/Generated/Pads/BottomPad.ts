import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class BottomPad extends PixUI.View {
    private readonly _tabController: PixUI.TabController<string>;

    public constructor() {
        super();
        this._tabController = new PixUI.TabController<string>(new System.List<string>().Init(["Problems", "Usages", "Output"
        ]));

        this.Child = new PixUI.Column().Init({
            Children: [new PixUI.TabBar<string>(this._tabController, BottomPad.BuildTab, true).Init({
                Height: PixUI.State.op_Implicit_From(40),
                Color: PixUI.State.op_Implicit_From(new PixUI.Color(0xFFF3F3F3))
            }), new PixUI.Container().Init({
                    Height: PixUI.State.op_Implicit_From(180),
                    Child: new PixUI.TabBody<string>(this._tabController, BottomPad.BuildBody)
                }
            )]
        });
    }

    private static BuildTab(title: string, tab: PixUI.Tab) {
        let textColor = PixUI.RxComputed.Make1(tab.IsSelected, selected => selected ? PixUI.Theme.FocusedColor : PixUI.Colors.Black
        );
        let bgColor = PixUI.RxComputed.Make1(tab.IsSelected, selected => selected ? PixUI.Colors.White : new PixUI.Color(0xFFF3F3F3));

        tab.Child = new PixUI.Container().Init({
            Color: bgColor,
            Width: PixUI.State.op_Implicit_From(100),
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.Only(10, 8, 0, 0)),
            Child: new PixUI.Text(PixUI.State.op_Implicit_From(title)).Init({Color: textColor}
            )
        });
    }

    private static BuildBody(title: string): PixUI.Widget {
        if (title == "Problems") {
            return BottomPad.BuildProblemsPad();
        }

        return new PixUI.Container().Init({
            Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
            Color: PixUI.State.op_Implicit_From(PixUI.Colors.White),
            Child: new PixUI.Text(PixUI.State.op_Implicit_From(title))
        });
    }

    private static BuildProblemsPad(): PixUI.Widget {
        let controller = new PixUI.DataGridController<IProblem>(new System.List<PixUI.DataGridColumn<IProblem>>().Init([new PixUI.DataGridTextColumn<IProblem>("Model", p => p.Model, PixUI.ColumnWidth.Fixed(150)), new PixUI.DataGridTextColumn<IProblem>("Position", p => p.Position, PixUI.ColumnWidth.Fixed(180)), new PixUI.DataGridTextColumn<IProblem>("Info", p => p.Info)]));

        return new PixUI.DataGrid<IProblem>(controller);
    }

    public Init(props: Partial<BottomPad>): BottomPad {
        Object.assign(this, props);
        return this;
    }
}

export interface IProblem {
    get Model(): string;

    get Position(): string;

    get Info(): string;

}
