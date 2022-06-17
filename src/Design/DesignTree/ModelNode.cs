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

    public ModelBase Model { get; internal set; }
    public readonly DocumentId? RoslynDocumentId;
    public readonly ProjectId? ServiceProjectId; //服务模型专用
    public readonly DocumentId? ServiceProxyDocumentId; //服务模型专用

    public override DesignNodeType Type => DesignNodeType.ModelNode;
    public override string Id => Model.Id.ToString();
    public override string Label => Model.Name;

    public override int Version
    {
        get => Model.Version;
        set => throw new NotSupportedException();
    }

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

    /// <summary>
    /// 保存模型节点(包括相关代码)
    /// </summary>
    public async Task SaveAsync(string? initSrcCode)
    {
        if (!IsCheckoutByMe) throw new Exception("ModelNode has not checkout");
        
        //TODO: 考虑事务保存模型及相关代码
        
        //先保存模型代码
        if (Model.PersistentState != PersistentState.Deleted)
        {
            //注意：不在此更新RoslynDocument, 实体模型通过设计命令更新,服务模型通过前端代码编辑器实时更新
            if (Model.ModelType == ModelType.Service || Model.ModelType == ModelType.View)
            {
                string srcCode;
                if (initSrcCode != null) srcCode = initSrcCode;
                else
                {
                    var doc = DesignTree!.DesignHub.TypeSystem.Workspace.CurrentSolution
                        .GetDocument(RoslynDocumentId)!;
                    var srcText = await doc.GetTextAsync();
                    srcCode = srcText.ToString();
                }

                await StagedService.SaveCodeAsync(Model.Id, srcCode);
            }
        }
        
        //再保存模型元数据
        await StagedService.SaveModelAsync(Model);
    }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte((byte)Model.ModelType);
    }
}