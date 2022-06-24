import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'
/// <summary>
/// 设计时全局状态
/// </summary>
export class DesignStore {
    public static readonly ActiveSidePad: PixUI.State<AppBoxDesign.SidePadType> = PixUI.State.op_Implicit_From(AppBoxDesign.SidePadType.DesignTree);

    public static readonly TreeController: PixUI.TreeController<AppBoxDesign.DesignNode> = new PixUI.TreeController<AppBoxDesign.DesignNode>(AppBoxDesign.DesignTreePad.BuildTreeNode, n => n.Children!);

    public static readonly DesignerController: PixUI.TabController<AppBoxDesign.DesignNode> = new PixUI.TabController<AppBoxDesign.DesignNode>(new System.List<AppBoxDesign.DesignNode>());

    private static _problemsController: Nullable<PixUI.DataGridController<AppBoxDesign.CodeProblem>>;

    public static get ProblemsController(): PixUI.DataGridController<AppBoxDesign.CodeProblem> {
        //延迟实始化 for web
        DesignStore._problemsController ??= new PixUI.DataGridController<AppBoxDesign.CodeProblem>(new System.List<PixUI.DataGridColumn<AppBoxDesign.CodeProblem>>().Init(
            [
                //new DataGridTextColumn<CodeProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                //new DataGridTextColumn<CodeProblem>("Model", p => p.Model, ColumnWidth.Fixed(150)),
                new PixUI.DataGridTextColumn<AppBoxDesign.CodeProblem>("Position", p => p.Position, PixUI.ColumnWidth.Fixed(180)),
                new PixUI.DataGridTextColumn<AppBoxDesign.CodeProblem>("Message", p => p.Message),
            ]));
        return DesignStore._problemsController;
    }

    public static OnNewNode(result: AppBoxDesign.NewNodeResult) {
        //TODO:result.RootNodeId !=null 重新刷新模型根节点，因为可能被其他开发者改变过目录结构

        let parentNode = DesignStore.TreeController.FindNode(n =>
            n.Type == result.ParentNodeType && n.Id == result.ParentNodeId)!;
        let newNode = DesignStore.TreeController.InsertNode(result.NewNode, parentNode, result.InsertIndex);
        DesignStore.TreeController.ExpandTo(newNode);
        DesignStore.TreeController.SelectNode(newNode);
    }

    public static UpdateProblems(modelNode: AppBoxDesign.ModelNode, problems: System.IList<AppBoxDesign.CodeProblem>) {
        //TODO:暂简单实现
        DesignStore.ProblemsController.DataSource = problems;
    }
}
