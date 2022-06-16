import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class BottomPad extends PixUI.View {
    private readonly _tabController: PixUI.TabController<string>;

    public constructor() {
        super();
        this._tabController = new PixUI.TabController<string>(new System.List<string>().Init(
            [
                "Problems", "Usages", "Output"
            ]));

        this.Child = new PixUI.Container().Init(
            {
                Height: PixUI.State.op_Implicit_From(190),
                Child: new PixUI.TabView<string>(this._tabController, BottomPad.BuildTab, BottomPad.BuildBody, false, 40).Init(
                    {SelectedTabColor: PixUI.Colors.White}),
            });
    }

    private static BuildTab(title: string, isSelected: PixUI.State<boolean>): PixUI.Widget {
        let textColor = PixUI.RxComputed.Make1(isSelected, selected => selected ? PixUI.Theme.FocusedColor : PixUI.Colors.Black
        );

        return new PixUI.Text(PixUI.State.op_Implicit_From(title)).Init({TextColor: textColor});
    }

    private static BuildBody(title: string): PixUI.Widget {
        if (title == "Problems") {
            return BottomPad.BuildProblemsPad();
        }

        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
                BgColor: PixUI.State.op_Implicit_From(PixUI.Colors.White),
                Child: new PixUI.Text(PixUI.State.op_Implicit_From(title)),
            });
    }

    private static BuildProblemsPad(): PixUI.Widget {
        let controller = new PixUI.DataGridController<IProblem>(new System.List<PixUI.DataGridColumn<IProblem>>().Init(
            [
                new PixUI.DataGridTextColumn<IProblem>("Model", p => p.Model, PixUI.ColumnWidth.Fixed(150)),
                new PixUI.DataGridTextColumn<IProblem>("Position", p => p.Position, PixUI.ColumnWidth.Fixed(180)),
                new PixUI.DataGridTextColumn<IProblem>("Info", p => p.Info),
            ]));

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
