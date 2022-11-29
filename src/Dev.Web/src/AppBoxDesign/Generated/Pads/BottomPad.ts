import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'

export class BottomPad extends PixUI.View {
    public constructor() {
        super();
        this.Child = new PixUI.Container().Init(
            {
                Height: PixUI.State.op_Implicit_From(190),
                Child: new PixUI.TabView<string>(AppBoxDesign.DesignStore.BottomPadController, BottomPad.BuildTab, BottomPad.BuildBody,
                    false, 40).Init(
                    {
                        SelectedTabColor: PixUI.Colors.White, TabBarBgColor: new PixUI.Color(0xFFF3F3F3)
                    }),
            });
    }

    private static BuildTab(title: string, isSelected: PixUI.State<boolean>): PixUI.Widget {
        let textColor = PixUI.RxComputed.Make1(isSelected,
            selected => selected ? PixUI.Theme.FocusedColor : PixUI.Colors.Black
        );

        return new PixUI.Text(PixUI.State.op_Implicit_From(title)).Init({TextColor: textColor});
    }

    private static BuildBody(title: string): PixUI.Widget {
        if (title == "Problems") {
            return new PixUI.DataGrid<AppBoxDesign.CodeProblem>(AppBoxDesign.DesignStore.ProblemsController).Init(
                {
                    Columns:
                        [
                            //new DataGridTextColumn<CodeProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                            new PixUI.DataGridTextColumn<AppBoxDesign.CodeProblem>("Position", p => p.Position).Init(
                                {Width: PixUI.ColumnWidth.Fixed(180)}),
                            new PixUI.DataGridTextColumn<AppBoxDesign.CodeProblem>("Message", p => p.Message),
                        ]
                });
        }

        if (title == "Usages") {
            return new PixUI.DataGrid<AppBoxDesign.ReferenceVO>(AppBoxDesign.DesignStore.UsagesController).Init(
                {
                    Columns:
                        [
                            new PixUI.DataGridTextColumn<AppBoxDesign.ReferenceVO>("Model", u => u.ModelName),
                            new PixUI.DataGridTextColumn<AppBoxDesign.ReferenceVO>("Location", u => u.Location),
                            //TODO: goto button column
                        ]
                });
        }

        return new PixUI.Container().Init(
            {
                Padding: PixUI.State.op_Implicit_From(PixUI.EdgeInsets.All(10)),
                BgColor: PixUI.State.op_Implicit_From(PixUI.Colors.White),
                Child: new PixUI.Text(PixUI.State.op_Implicit_From(title)),
            });
    }
}
