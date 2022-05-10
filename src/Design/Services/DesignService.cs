using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignService : IService
{
    private readonly Dictionary<CharsKey, IDesignHandler> _handlers = new()
    {
        { "LoadDesignTree", new LoadDesignTree() },
    };

    public ValueTask<AnyValue> InvokeAsync(ReadOnlyMemory<char> method, InvokeArgs args)
    {
        if (RuntimeContext.CurrentSession is not IDeveloperSession session)
            throw new Exception("Must login as a developer");

        var designHub = session.GetDesignHub();
        if (!_handlers.TryGetValue(method, out var handler))
            throw new Exception($"Unknown design request: {method}");

        return handler.Handle(designHub, args);
    }
}