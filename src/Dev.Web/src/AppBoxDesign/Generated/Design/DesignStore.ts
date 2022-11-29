import * as AppBoxCore from '@/AppBoxCore'
import * as System from '@/System'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as PixUI from '@/PixUI'
/// <summary>
/// 设计时全局状态
/// </summary>
export class DesignStore {

    public static readonly ActiveSidePad: PixUI.State<AppBoxDesign.SidePadType> = PixUI.State.op_Implicit_From(AppBoxDesign.SidePadType.DesignTree);

    public static readonly TreeController: PixUI.TreeController<AppBoxDesign.DesignNodeVO> = new PixUI.TreeController<AppBoxDesign.DesignNodeVO>(AppBoxDesign.DesignTreePad.BuildTreeNode, n => n.Children!);

    public static readonly DesignerController: PixUI.TabController<AppBoxDesign.DesignNodeVO> = new PixUI.TabController<AppBoxDesign.DesignNodeVO>(new System.List<AppBoxDesign.DesignNodeVO>());

    public static readonly BottomPadController: PixUI.TabController<string> = new PixUI.TabController<string>(new System.List<string>().Init(
        [
            "Problems", "Usages", "Output"
        ]));

    public static readonly ProblemsController: PixUI.DataGridController<AppBoxDesign.CodeProblem> = new PixUI.DataGridController<AppBoxDesign.CodeProblem>();

    public static readonly UsagesController: PixUI.DataGridController<AppBoxDesign.ReferenceVO> = new PixUI.DataGridController<AppBoxDesign.ReferenceVO>();

    public static get ActiveDesigner(): Nullable<AppBoxDesign.IDesigner> {
        let selectedIndex = DesignStore.DesignerController.SelectedIndex;
        if (selectedIndex < 0)
            return null;
        return DesignStore.DesignerController.GetAt(selectedIndex).Designer;
    }


    public static OnNewNode(result: AppBoxDesign.NewNodeResult) {
        //TODO:result.RootNodeId !=null 重新刷新模型根节点，因为可能被其他开发者改变过目录结构

        let newNode = DesignStore.TreeController.InsertNode(
            result.NewNode, result.ParentNode, result.InsertIndex);
        DesignStore.TreeController.ExpandTo(newNode);
        DesignStore.TreeController.SelectNode(newNode);
    }

    public static OnDeleteNode(node: PixUI.TreeNode<AppBoxDesign.DesignNodeVO>, modelRootNodeIdString: Nullable<string>) {
        // 移除选中节点打开的设计器
        DesignStore.DesignerController.Remove(node.Data);
        // 从设计树中移除选中的节点
        //TODO: 刷新模型根节点 if (modelRootNodeIdString != null)
        DesignStore.TreeController.RemoveNode(node);
    }

    public static OnRenameDone(referenceType: AppBoxCore.ModelReferenceType, modelId: string, affects: string[]) {
        //TODO: 如果重命名模型，刷新模型显示文本
        //根据返回结果刷新所有已打开的设计器
        for (let i = 0; i < DesignStore.DesignerController.Count; i++) {
            let designer = DesignStore.DesignerController.GetAt(i).Designer;
            if (designer != null) {
                if (AppBoxDesign.IsInterfaceOfIModelDesigner(designer)) {
                    const modelDesigner = designer;
                    if (affects.Contains(modelDesigner.ModelNode.Id))
                        designer.RefreshAsync();
                }
            }
        }
    }

    public static UpdateProblems(modelNode: AppBoxDesign.ModelNodeVO, problems: System.IList<AppBoxDesign.CodeProblem>) {
        //TODO:暂简单实现
        DesignStore.ProblemsController.DataSource = problems;
    }

    public static UpdateUsages(usages: System.IList<AppBoxDesign.ReferenceVO>) {
        DesignStore.UsagesController.DataSource = usages;
        DesignStore.BottomPadController.SelectAt(1);
    }

    public static OpenOrActiveDesigner(node: AppBoxDesign.DesignNodeVO, gotoReference: Nullable<AppBoxDesign.ReferenceVO>) {
        //先检查是否已经打开
        let existsIndex = DesignStore.DesignerController.IndexOf(node);
        if (existsIndex < 0)
            DesignStore.DesignerController.Add(node);
        else
            DesignStore.DesignerController.SelectAt(existsIndex);

        if (gotoReference != null)
            node.Designer!.GotoDefinition(gotoReference);
    }


    public static FindDesignNodeById(nodeId: string): Nullable<AppBoxDesign.DesignNodeVO> {
        let node = DesignStore.TreeController.FindNode(n => n.Id == nodeId);
        return node?.Data;
    }

    public static GetAllEntityNodes(): System.IList<AppBoxDesign.ModelNodeVO> {
        let list = new System.List<AppBoxDesign.ModelNodeVO>();
        let appRootNode = DesignStore.TreeController.DataSource![1];
        for (const appNode of appRootNode.Children!) {
            let entityRootNode = appNode.Children![0];
            DesignStore.LoopAddEntityNode(entityRootNode, list);
        }

        return list;
    }

    private static LoopAddEntityNode(node: AppBoxDesign.DesignNodeVO, list: System.IList<AppBoxDesign.ModelNodeVO>) {
        if (node instanceof AppBoxDesign.ModelNodeVO) {
            const modelNode = node;
            list.Add(modelNode);
        } else {
            if (node.Children != null) {
                for (const child of node.Children!) {
                    DesignStore.LoopAddEntityNode(child, list);
                }
            }
        }
    }


}
