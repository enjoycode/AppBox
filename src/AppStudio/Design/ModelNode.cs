using AppBoxCore;
using Microsoft.CodeAnalysis;
using PixUI;

namespace AppBoxDesign;

public sealed class ModelNode : DesignNode
{
    public ModelNode(ModelBase model, DesignHub hub)
    {
        Model = model;
        Label = new RxProxy<string>(() => Model.Name);

        // 创建Roslyn相关标识
        switch (model.ModelType)
        {
            case ModelType.Entity:
                RoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ModelProjectId);
                ExtRoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ViewsProjectId /*暂直接放在视图工程内*/);
                break;
            case ModelType.View:
                RoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ViewsProjectId);
                break;
            case ModelType.Service:
                ServiceProjectId = ProjectId.CreateNewId();
                RoslynDocumentId = DocumentId.CreateNewId(ServiceProjectId);
                ExtRoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ServiceProxyProjectId);
                break;
            case ModelType.Permission:
                RoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ServiceBaseProjectId);
                ExtRoslynDocumentId = DocumentId.CreateNewId(hub.TypeSystem.ViewsProjectId);
                break;
        }
    }

    public ModelBase Model { get; internal set; }

    public ModelType ModelType => Model.ModelType;

    /// <summary>
    /// 虚拟工程对应的RoslynDocument标识
    /// </summary>
    public readonly DocumentId? RoslynDocumentId;

    /// <summary>
    /// 服务模型对应的虚拟工程标识
    /// </summary>
    public readonly ProjectId? ServiceProjectId;

    /// <summary>
    /// 扩展的RoslynDocument标识，服务模型为代理，实体模型为前端响应实体类
    /// </summary>
    public readonly DocumentId? ExtRoslynDocumentId;

    public override DesignNodeType Type => DesignNodeType.ModelNode;
    public override string Id => Model.Id.ToString();
    public override State<string> Label { get; }

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
    public async Task SaveAsync(string? initOrNewSrcCode)
    {
        if (!IsCheckoutByMe) throw new Exception("ModelNode has not checkout");

        //TODO: 考虑事务保存模型及相关代码

        //先保存模型代码
        var hub = DesignHub.Current;
        if (Model.PersistentState != PersistentState.Deleted)
        {
            var typeSystem = DesignTree!.DesignHub.TypeSystem;
            //注意：不在此更新RoslynDocument, 实体模型通过设计命令更新,服务模型通过前端代码编辑器实时更新
            if (Model.ModelType == ModelType.Service || Model.ModelType == ModelType.View)
            {
                string srcCode;
                if (initOrNewSrcCode != null) srcCode = initOrNewSrcCode;
                else
                {
                    var doc = typeSystem.Workspace.CurrentSolution.GetDocument(RoslynDocumentId)!;
                    var srcText = await doc.GetTextAsync();
                    srcCode = srcText.ToString();
                }

                await hub.StagedService.SaveCodeAsync(Model.Id, srcCode);

                //如果是非新建的服务模型需要更新服务代理(注意用initSrcCode判断是否刚创建的)
                if (Model.ModelType == ModelType.Service && initOrNewSrcCode == null)
                    await typeSystem.UpdateServiceProxyDocumentAsync(this);
            }
            else if (Model.ModelType == ModelType.Report)
            {
                var srcCode = string.IsNullOrEmpty(initOrNewSrcCode) ? string.Empty : initOrNewSrcCode;
                await hub.StagedService.SaveCodeAsync(Model.Id, srcCode);
            }
        }

        //再保存模型元数据
        await hub.StagedService.SaveModelAsync(Model);
    }
}