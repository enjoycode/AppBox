using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

public sealed class ModelNode : DesignNode
{
    public readonly ModelBase Model;
    public readonly DocumentId? RoslynDocumentId;

    public ModelNode(ModelBase model, DesignHub hub)
    {
        Model = model;

        RoslynDocumentId = model.ModelType switch
        {
            ModelType.Entity => DocumentId.CreateNewId(hub.TypeSystem.ModelProjectId),
            ModelType.View => DocumentId.CreateNewId(hub.TypeSystem.WebViewsProjectId),
            _ => null
        };
    }

    public override DesignNodeType Type => DesignNodeType.ModelNode;
    public override string Id => Model.Id.ToString();
    public override string Label => Model.Name;

    public ApplicationNode AppNode
    {
        get
        {
            var cur = Parent;
            while (cur!.Type != DesignNodeType.ApplicationNode)
            {
                cur = cur.Parent;
            }

            return (ApplicationNode)cur;
        }
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte((byte)Model.ModelType);
    }
}