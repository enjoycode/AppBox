using System.Collections.Generic;
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

        internal static readonly TreeController<DesignNode> TreeController =
            new TreeController<DesignNode>(DesignTreePad.BuildTreeNode, n => n.Children!);

        internal static readonly TabController<DesignNode> DesignerController =
            new TabController<DesignNode>(new List<DesignNode>());

        /// <summary>
        /// 新建成功返回后刷新模型根节点或添加新建的节点
        /// </summary>
        internal static void OnNewNode(NewNodeResult result)
        {
            //TODO:
        }
    }
}