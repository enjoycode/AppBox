using AppBoxClient.Dynamic;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

/// <summary>
/// 设计时全局状态
/// </summary>
internal sealed class DesignStore
{
    public DesignStore()
    {
        Commands = new Commands(this);
    }

    #region ====State and Controllers====

    internal readonly Commands Commands;

    /// <summary>
    /// 当前选择的侧边栏
    /// </summary>
    public readonly State<SidePadType> ActiveSidePad = SidePadType.DesignTree;

    /// <summary>
    /// 模型树控制器
    /// </summary>
    internal readonly TreeController<DesignNode> TreeController = new();

    /// <summary>
    /// 设计器控制器
    /// </summary>
    internal readonly TabController<DesignNode> DesignerController = new(new List<DesignNode>());

    internal readonly TabController<string> BottomPadController =
        new(new List<string> { "Problems", "Usages", "Output" });

    /// <summary>
    ///  问题列表控制器
    /// </summary>
    internal readonly DataGridController<CodeProblem> ProblemsController = new();

    /// <summary>
    /// 引用列表控制器
    /// </summary>
    internal readonly DataGridController<Reference> UsagesController = new();

    internal IDesigner? ActiveDesigner
    {
        get
        {
            var selectedIndex = DesignerController.SelectedIndex;
            if (selectedIndex < 0)
                return null;
            return DesignerController.GetAt(selectedIndex).Designer;
        }
    }

    #endregion

    #region ====Actions====

    /// <summary>
    /// 新建成功返回后刷新模型根节点或添加新建的节点
    /// </summary>
    internal void OnNewNode(NewNodeResult result)
    {
        //TODO:result.RootNodeId !=null 重新刷新模型根节点，因为可能被其他开发者改变过目录结构
        
        var newNode = TreeController.InsertNode(
            result.NewNode, result.ParentNode, result.InsertIndex);
        TreeController.ExpandTo(newNode);
        TreeController.SelectNode(newNode);
    }

    /// <summary>
    /// 删除成功返回后刷新
    /// </summary>
    internal void OnDeleteNode(TreeNode<DesignNode> node, string? modelRootNodeIdString)
    {
        // 移除选中节点打开的设计器
        DesignerController.Remove(node.Data);
        // 从设计树中移除选中的节点
        //TODO: 刷新模型根节点 if (modelRootNodeIdString != null)
        TreeController.RemoveNode(node);
    }

    internal void OnRenameDone(ModelReferenceType referenceType, string modelId, string[] affects)
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

    internal void UpdateProblems(ModelNode modelNode, IList<CodeProblem> problems)
    {
        //TODO:暂简单实现
        ProblemsController.DataSource = problems;
    }

    internal void UpdateUsages(IList<Reference> usages)
    {
        UsagesController.DataSource = usages;
        BottomPadController.SelectAt(1);
    }

    internal void GotoReference(Reference reference)
    {
        var node = FindDesignNodeById(reference.ModelId);
        if (node != null)
            OpenOrActiveDesigner(node, reference);
    }

    internal void GotoProblem(CodeProblem problem)
    {
        var designer = ActiveDesigner; //TODO:暂仅限当前激活的设计器
        if (designer is ICodeDesigner codeDesigner)
            codeDesigner.GotoProblem(problem);
    }

    /// <summary>
    /// 打开或激活指定节点的设计器, 并且如果需要则跳转至指定位置
    /// </summary>
    internal void OpenOrActiveDesigner(DesignNode node, Reference? gotoReference)
    {
        //先检查是否已经打开
        var existsIndex = DesignerController.IndexOf(node);
        if (existsIndex < 0)
            DesignerController.Add(node);
        else
            DesignerController.SelectAt(existsIndex);

        if (gotoReference != null)
            node.Designer!.GotoDefinition(gotoReference);
    }

    /// <summary>
    /// 构建应用后重新构建动态组件的工具箱
    /// </summary>
    internal Task RebuildDynamicToolbox( /*TODO: 变更列表*/)
    {
        //TODO:**暂简单实现，应根据变更列表重新注册动态组件，同时重新刷新所有打开的相关设计器
        return DynamicInitiator.RebuildDynamicToolbox();
    }

    #endregion

    #region ====设计节点相关查找方法====
    
    //TODO:考虑以下方法移至DesignHub

    /// <summary>
    /// 根据节点标识找到相应的节点
    /// </summary>
    internal DesignNode? FindDesignNodeById(string nodeId)
    {
        var node = TreeController.FindNode(n => n.Id == nodeId);
        return node?.Data;
    }

    /// <summary>
    /// 获取节点对应的ModelRootNode
    /// </summary>
    internal static TreeNode<DesignNode> GetModelRootNode(TreeNode<DesignNode> child)
    {
        var childType = child.Data.Type;
        if (childType != DesignNodeType.ModelNode && childType != DesignNodeType.FolderNode &&
            childType != DesignNodeType.ModelRootNode)
            throw new ArgumentException("child must belong ModelRootNode");

        var temp = child;
        while (temp != null)
        {
            if (temp.Data.Type == DesignNodeType.ModelRootNode)
                return temp;
            temp = temp.ParentNode;
        }

        throw new Exception("Never");
    }

    /// <summary>
    /// 获取所有实体节点
    /// </summary>
    internal IList<ModelNode> GetAllEntityNodes()
    {
        var list = new List<ModelNode>();
        var appRootNode = (ApplicationRootNode)TreeController.DataSource![1];
        foreach (var appNode in appRootNode.Children)
        {
            var entityRootNode = appNode.Children[0];
            LoopAddEntityNode(entityRootNode, list);
        }

        return list;
    }

    private static void LoopAddEntityNode(DesignNode node, IList<ModelNode> list)
    {
        if (node is ModelNode modelNode)
        {
            list.Add(modelNode);
        }
        else if (node is FolderNode folderNode)
        {
            foreach (var child in folderNode.Children)
            {
                LoopAddEntityNode(child, list);
            }
        }
    }

    /// <summary>
    /// 获取引用了指定实体的所有EntityRef成员
    /// </summary>
    internal static EntityMemberInfo[] GetAllEntityRefs(ModelId modelId)
    {
        var designTree = DesignHub.Current.DesignTree;
        var entityRefs = designTree.FindAllEntityRefs(modelId);
        var res = entityRefs
            .Select(m => new EntityMemberInfo()
            {
                AppName = designTree.FindApplicationNode(m.Owner.AppId)!.Model.Name,
                ModelName = m.Owner.Name,
                MemberName = m.Name,
                ModelId = m.Owner.Id.ToString(),
                MemberId = m.MemberId
            })
            .ToArray();
        return res;
    }

    #endregion
}