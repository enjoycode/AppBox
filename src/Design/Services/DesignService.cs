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
        { nameof(DeleteNode), new DeleteNode() },
        { nameof(Rename), new Rename() },
        { nameof(FindUsages), new FindUsages() },
        { nameof(BuildApp), new BuildApp() },
        // Tree
        { nameof(LoadDesignTree), new LoadDesignTree() },
        { nameof(CheckoutNode), new CheckoutNode() },
        // Code
        { nameof(ChangeBuffer), new ChangeBuffer() },
        { nameof(GetProblems), new GetProblems() },
        { nameof(GetCompletion), new GetCompletion() },
        { nameof(GetSignatures), new GetSignatures() },
        { nameof(OpenCodeModel), new OpenCodeModel() },
        { nameof(GotoDefinition), new GotoDefinition() },
        { nameof(FormatDocument), new FormatDocument() },
        // Entity
        { nameof(NewEntityModel), new NewEntityModel() },
        { nameof(NewEntityMember), new NewEntityMember() },
        { nameof(DeleteEntityMember), new DeleteEntityMember() },
        { nameof(OpenEntityModel), new OpenEntityModel() },
        { nameof(ChangePrimaryKeys), new ChangePrimaryKeys() },
        { nameof(GetAllEntityRefs), new GetAllEntityRefs() },
        { nameof(GetEntityPreview), new GetEntityPreview() },
        // Service
        { nameof(NewServiceModel), new NewServiceModel() },
        // View
        { nameof(NewViewModel), new NewViewModel() },
        // { nameof(GetWebPreview), new GetWebPreview() },
        { nameof(GetDesktopPreview), new GetDesktopPreview() },
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