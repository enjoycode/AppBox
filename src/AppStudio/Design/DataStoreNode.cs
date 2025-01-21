using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

public sealed class DataStoreNode : DesignNode
{
    public DataStoreNode(DataStoreModel model)
    {
        Model = model;
        Label = new RxProxy<string>(() => Model.Name);
    }

    internal static readonly DataStoreNode None = new(new DataStoreModel(DataStoreKind.None, string.Empty, null));

    internal readonly DataStoreModel Model;

    public override DesignNodeType Type => DesignNodeType.DataStoreNode;
    public override State<string> Label { get; }

    public override string Id => ((ulong)Model.Id).ToString();
}