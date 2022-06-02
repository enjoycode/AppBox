using AppBoxCore;
using Microsoft.CodeAnalysis;

namespace AppBoxDesign;

public sealed class ModelNode : DesignNode
{
    public ModelNode(ModelBase model, DesignHub hub)
    {
        Model = model;

        // 创建Roslyn相关标识
        switch (model.ModelType)
        {
            case ModelType.Entity:
                RoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ModelProjectId);
                break;
            case ModelType.View:
                RoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.WebViewsProjectId);
                break;
            case ModelType.Service:
                ServiceProjectId = ProjectId.CreateNewId();
                RoslynDocumentId = DocumentId.CreateNewId(ServiceProjectId);
                ServiceProxyDocumentId =
                    DocumentId.CreateNewId(hub.TypeSystem.ServiceProxyProjectId);
                break;
        }
    }

    public readonly ModelBase Model;
    public readonly DocumentId? RoslynDocumentId;
    public readonly ProjectId? ServiceProjectId; //服务模型专用
    public readonly DocumentId? ServiceProxyDocumentId; //服务模型专用

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