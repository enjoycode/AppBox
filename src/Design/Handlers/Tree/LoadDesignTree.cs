using AppBoxCore;

namespace AppBoxDesign;

internal sealed class LoadDesignTree : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        await hub.DesignTree.LoadAsync();
        return AnyValue.From(hub.DesignTree.RootNodes.ToArray());
    }
}