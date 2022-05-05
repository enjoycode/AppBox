using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignHub : IDisposable
{
    public readonly IDeveloperSession Session;
    public readonly DesignTree DesignTree;

    public DesignHub(IDeveloperSession session)
    {
        Session = session;
        DesignTree = new DesignTree(this);
    }

    public void Dispose() { }

    static DesignHub()
    {
        //注册设计时序列化器，仅用于向前端序列化，不需要反序列化
        TypeSerializer.RegisterKnownType(new BinSerializer(PayloadType.DesignTree,
            typeof(DesignTree)));
    }
}