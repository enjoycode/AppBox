using AppBoxCore;

namespace AppBoxDesign;

public sealed class DesignService : IService
{
    private readonly Dictionary<CharsKey, IDesignHandler> _handlers = new()
    {
        { nameof(SaveModel), new SaveModel() },
        { nameof(GetPendingChanges), new GetPendingChanges() },
        { nameof(Publish), new Publish() },
        { nameof(CloseDesigner), new CloseDesigner() },
        // Tree
        { nameof(LoadDesignTree), new LoadDesignTree() },
        { nameof(CheckoutNode), new CheckoutNode() },
        // Code
        { nameof(ChangeBuffer), new ChangeBuffer() },
        { nameof(GetProblems), new GetProblems() },
        { nameof(GetCompletion), new GetCompletion() },
        { nameof(GetSignatures), new GetSignatures() },
        // Entity
        { nameof(OpenEntityModel), new OpenEntityModel() },
        { nameof(GetEntityPreview), new GetEntityPreview() },
        // Service
        { nameof(NewServiceModel), new NewServiceModel() },
        { nameof(OpenServiceModel), new OpenServiceModel() },
        // View
        { nameof(NewViewModel), new NewViewModel() },
        { nameof(OpenViewModel), new OpenViewModel() },
        { nameof(GetWebPreview), new GetWebPreview() },
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