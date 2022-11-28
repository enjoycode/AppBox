using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Formatting;

namespace AppBoxDesign;

internal sealed class FormatDocument: IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        ModelId modelId = args.GetString()!;
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var newDoc = await Formatter.FormatAsync(doc);
        var changes = await newDoc.GetTextChangesAsync(doc);
        var res = changes
            .OrderByDescending(c => c.Span);

        return AnyValue.From(ws =>
        {
            ws.WriteByte((byte)PayloadType.Array);
            ws.WriteByte(0);
            ws.WriteByte((byte)PayloadType.TextChange);
            
            ws.WriteVariant(res.Count());
            foreach (var change in res)
            {
                ws.WriteInt(change.Span.Start);
                ws.WriteInt(change.Span.Length);
                ws.WriteString(change.NewText);
            }
        });
    }
}