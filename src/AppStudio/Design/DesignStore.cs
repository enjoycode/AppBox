using System.Collections.Generic;
using System.Linq;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign
{
    /// <summary>
    /// 设计时全局状态
    /// </summary>
    public static class DesignStore
    {
        /// <summary>
        /// 当前选择的侧边栏
        /// </summary>
        public static readonly State<SidePadType> ActiveSidePad = SidePadType.DesignTree;

        /// <summary>
        /// 模型树控制器
        /// </summary>
        internal static readonly TreeController<DesignNodeVO> TreeController =
            new TreeController<DesignNodeVO>(DesignTreePad.BuildTreeNode, n => n.Children!);

        /// <summary>
        /// 设计器控制器
        /// </summary>
        internal static readonly TabController<DesignNodeVO> DesignerController =
            new TabController<DesignNodeVO>(new List<DesignNodeVO>());

        private static DataGridController<CodeProblem>? _problemsController;

        /// <summary>
        /// 问题列表控制器
        /// </summary>
        internal static DataGridController<CodeProblem> ProblemsController
        {
            get
            {
                //延迟实始化 for web
                _problemsController ??= new DataGridController<CodeProblem>();
                return _problemsController;
            }
        }

        /// <summary>
        /// 新建成功返回后刷新模型根节点或添加新建的节点
        /// </summary>
        internal static void OnNewNode(NewNodeResult result)
        {
            //TODO:result.RootNodeId !=null 重新刷新模型根节点，因为可能被其他开发者改变过目录结构

            var parentNode = TreeController.FindNode(n =>
                n.Type == result.ParentNodeType && n.Id == result.ParentNodeId)!;
            var newNode = TreeController.InsertNode(result.NewNode, parentNode, result.InsertIndex);
            TreeController.ExpandTo(newNode);
            TreeController.SelectNode(newNode);
        }

        /// <summary>
        /// 删除成功返回后刷新
        /// </summary>
        internal static void OnDeleteNode(TreeNode<DesignNodeVO> node,
            string? modelRootNodeIdString)
        {
            // 移除选中节点打开的设计器
            DesignerController.Remove(node.Data);
            // 从设计树中移除选中的节点
            //TODO: 刷新模型根节点 if (modelRootNodeIdString != null)
            TreeController.RemoveNode(node);
        }

        internal static void OnRenameDone(ModelReferenceType referenceType, string modelId,
            string[] affects)
        {
            //TODO: 如果重命名模型，刷新模型显示文本
            //根据返回结果刷新所有已打开的设计器
            for (var i = 0; i < DesignerController.Count; i++)
            {
                var designer = DesignerController.GetAt(i).Designer;
                if (designer != null)
                {
                    if (designer is IModelDesigner modelDesigner)
                    {
                        if (affects.Contains(modelDesigner.ModelNode.Id)) 
                            designer.RefreshAsync();
                    }
                }
            }
        }

        internal static void UpdateProblems(ModelNodeVO modelNode, IList<CodeProblem> problems)
        {
            //TODO:暂简单实现
            ProblemsController.DataSource = problems;
        }

        /// <summary>
        /// 获取所有实体节点
        /// </summary>
        internal static IList<ModelNodeVO> GetAllEntityNodes()
        {
            var list = new List<ModelNodeVO>();
            var appRootNode = TreeController.DataSource![1];
            foreach (var appNode in appRootNode.Children!)
            {
                var entityRootNode = appNode.Children![0];
                LoopAddEntityNode(entityRootNode, list);
            }

            return list;
        }

        private static void LoopAddEntityNode(DesignNodeVO node, IList<ModelNodeVO> list)
        {
            if (node is ModelNodeVO modelNode)
                list.Add(modelNode);
            else
            {
                if (node.Children != null)
                {
                    foreach (var child in node.Children!)
                    {
                        LoopAddEntityNode(child, list);
                    }
                }
            }
        }
    }
}