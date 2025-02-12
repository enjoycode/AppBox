using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

public sealed class FolderNode : DesignNode, IChildrenNode
{
    public FolderNode(ModelFolder folder)
    {
        Folder = folder;
        Children = new DesignNodeList<DesignNode>(this);
        Label = new RxProxy<string>(() => Folder.Name ?? string.Empty);
    }

    public override DesignNodeType Type => DesignNodeType.FolderNode;

    internal DesignNodeList<DesignNode> Children { get; }

    public ModelFolder Folder { get; internal set; }

    // internal override int SortNo => int.MinValue;

    public override string Id => Folder.Id.ToString();
    public override State<string> Label { get; }

    //注意：处理顶级Folder.Version
    public override int Version
    {
        get => Folder.GetRoot().Version;
        set => Folder.GetRoot().Version = value;
    }

    public ModelRootNode? ModelRootNode
    {
        get
        {
            var temp = Parent;
            while (temp != null)
            {
                if (temp is ModelRootNode modelRootNode)
                    return modelRootNode;
                temp = temp.Parent;
            }

            return null;
        }
    }

    public IList<DesignNode> GetChildren() => Children.List;

    internal override CheckoutInfo? CheckoutInfo
    {
        get
        {
            //注意：返回相应的模型根节点的签出信息
            var modelRootNode = ModelRootNode;
            return modelRootNode?.CheckoutInfo;
        }
        set => throw new NotSupportedException("FolderNode can not set CheckoutInfo");
    }

    internal Task SaveAsync()
    {
        //查找文件夹直至根级文件夹，然后序列化保存根级文件夹
        var rootFolder = Folder.GetRoot();
        //保存节点模型
        return DesignHub.Current.StagedService.SaveFolderAsync(rootFolder);
    }
}