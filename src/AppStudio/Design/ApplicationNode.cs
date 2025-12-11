using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

public sealed class ApplicationNode : DesignNode, IChildrenNode
{
    public ApplicationNode(DesignTree tree, ApplicationModel model)
    {
        Model = model;
        Label = new RxProxy<string>(() => Model.Name);
        Children = new DesignNodeList<ModelRootNode>(this);

        //按ModelType项顺序添加模型根节点
        for (var i = 0; i < 8; i++)
        {
            if (i == (int)ModelType.Event)
                continue; //TODO: 暂简单跳过待移除的事件模型
            var modelRoot = new ModelRootNode((ModelType)i);
            Children.Add(modelRoot);
            tree.BindCheckoutInfo(modelRoot, false);
        }
    }

    public readonly ApplicationModel Model;
    public readonly DesignNodeList<ModelRootNode> Children;

    public override DesignNodeType Type => DesignNodeType.ApplicationNode;
    public override State<string> Label { get; }

    public IList<DesignNode> GetChildren() => Children.List.Cast<DesignNode>().ToList();

    /// <summary>
    /// 签入当前应用节点下所有子节点
    /// </summary>
    internal void CheckinAllNodes()
    {
        for (var i = 0; i < Children.Count; i++)
        {
            Children[i].CheckInAllNodes();
        }
    }

    public ModelRootNode FindModelRootNode(ModelType modelType)
        => modelType != ModelType.Permission ? Children[(int)modelType] : Children[6]; //TODO: 暂简单跳过待移除的事件模型

    internal FolderNode? FindFolderNode(Guid folderId)
    {
        for (var i = 0; i < Children.Count; i++)
        {
            var res = Children[i].FindFolderNode(folderId);
            if (res != null)
                return res;
        }

        return null;
    }
}