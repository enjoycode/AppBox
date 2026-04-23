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
    /// 用于删除或导入时签出所有模型根节点
    /// </summary>
    internal async Task CheckoutAllModelRootNodes()
    {
        foreach (var modelRootNode in Children)
        {
            var checkoutOk = await modelRootNode.CheckoutAsync();
            if (!checkoutOk)
                throw new Exception($"Can't checkout model root: {modelRootNode.TargetType}.");
        }
    }

    /// <summary>
    /// 用于删除或导入时签出所有模型节点
    /// </summary>
    internal async Task CheckoutAllModelNodes()
    {
        for (var i = 0; i < Children.Count; i++)
        {
            foreach (var modelNode in Children[i].GetAllModelNodes())
            {
                var checkoutOk = await modelNode.CheckoutAsync();
                if (!checkoutOk)
                    throw new Exception($"Can't checkout model node: {modelNode.Model.Name}.");
            }
        }
    }

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

    /// <summary>
    /// 获取所有模型节点
    /// </summary>
    internal IEnumerable<ModelNode> GetAllModelNodes() =>
        Children.SelectMany(t => t.GetAllModelNodes());

    /// <summary>
    /// 获取所有根文件夹
    /// </summary>
    internal IEnumerable<ModelFolder> GetAllRootFolders()
    {
        for (var i = 0; i < Children.Count; i++)
        {
            if (Children[i].RootFolder != null)
                yield return Children[i].RootFolder!;
        }
    }
}