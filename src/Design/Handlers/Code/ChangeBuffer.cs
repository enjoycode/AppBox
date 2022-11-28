using AppBoxCore;
using Microsoft.CodeAnalysis.Text;

namespace AppBoxDesign;

internal sealed class ChangeBuffer : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var targetType = args.GetInt();
        var targetId = args.GetString()!;
        var offset = args.GetInt();
        var length = args.GetInt();
        var text = args.GetString();

        if (targetType != 0) throw new NotImplementedException("非模型代码变更");

        ModelId modelId = (long)ulong.Parse(targetId);
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var sourceText = await doc.GetTextAsync().ConfigureAwait(false);
        sourceText = sourceText.WithChanges(new TextChange(new TextSpan(offset, length), text ?? ""));
        hub.TypeSystem.Workspace.OnDocumentChanged(doc.Id, sourceText);

        return AnyValue.Empty;
    }
}