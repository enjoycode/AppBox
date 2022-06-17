using AppBoxCore;

namespace AppBoxDesign;

public sealed class FolderNode : DesignNode
{
    public FolderNode(ModelFolder folder)
    {
        Folder = folder;
        Children = new DesignNodeList<DesignNode>(this);
    }

    public override DesignNodeType Type => DesignNodeType.FolderNode;

    internal DesignNodeList<DesignNode> Children { get; }

    public ModelFolder Folder { get; internal set; }

    // internal override int SortNo => int.MinValue;

    public override string Id => Folder.Id.ToString();
    public override string Label => Folder.Name ?? string.Empty;

    //注意：处理顶级Folder.Version
    public override int Version
    {
        get => Folder.GetRoot().Version;
        set => Folder.GetRoot().Version = value;
    }

    internal override CheckoutInfo? CheckoutInfo
    {
        get
        {
            //注意：返回相应的模型根节点的签出信息
            var rootFolder = Folder.GetRoot();
            var rootNode =
                DesignTree!.FindModelRootNode(rootFolder.AppId, rootFolder.TargetModelType);
            return rootNode!.CheckoutInfo;
        }
        set => throw new NotSupportedException("FolderNode can not set CheckoutInfo");
    }

    internal Task SaveAsync()
    {
        //查找文件夹直至根级文件夹，然后序列化保存根级文件夹
        var rootFolder = Folder.GetRoot();
        //保存节点模型
        return StagedService.SaveFolderAsync(rootFolder);
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        Children.WriteTo(ws);
    }
}