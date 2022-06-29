using AppBoxCore;

namespace AppBoxDesign;

/// <summary>
/// 删除模型或文件夹或整个应用
/// </summary>
internal sealed class DeleteNode : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var selectedNodeType = (DesignNodeType)args.GetInt();
        var selectedNodeIdString = args.GetString()!;
        var deleteNode = hub.DesignTree.FindNode(selectedNodeType, selectedNodeIdString);
        if (deleteNode == null)
            throw new Exception("Can't find node");
        if (!(deleteNode is ModelNode || deleteNode is ApplicationNode ||
              deleteNode is FolderNode folderNode && folderNode.Children.Count == 0))
            throw new Exception("Can not delete it.");

        DesignNode? rootNode;
        if (deleteNode is ModelNode modelNode)
            rootNode = await DeleteModelNode(hub, modelNode);
        else
            throw new NotImplementedException();

        //注意：返回rootNode.ID用于前端重新刷新模型根节点
        return  AnyValue.From(rootNode == null ? string.Empty : rootNode.Id);
    }

    private static async Task<DesignNode?> DeleteModelNode(DesignHub hub, ModelNode node)
    {
        // 查找ModelRootNode
        var modelRootNode = hub.DesignTree.FindModelRootNode(node.Model.AppId, node.Model.ModelType)!;
        var rootNodeHasCheckout = modelRootNode.IsCheckoutByMe;
        // 尝试签出模型节点及根节点
        var nodeCheckout = await node.CheckoutAsync();
        var rootCheckout = await modelRootNode.CheckoutAsync();
        if (!nodeCheckout || !rootCheckout)
            throw new Exception("Can't checkout nodes.");
        // 注意：如果自动签出了模型根节点，当前选择的节点需要重新指向，因为Node.Checkout()时已重新加载
        if (!rootNodeHasCheckout)
            node = modelRootNode.FindModelNode(node.Model.Id)!;
        if (node == null) //可能已不存在
            throw new Exception("Delete target not exists, please refresh.");
        // 判断当前节点所属层是否是系统层
        if (node.Model.ModelLayer == ModelLayer.SYS)
            throw new Exception("Can't delete system model.");
        var model = node.Model;
        // TODO:***查找引用项
//         var usages = await RefactoringService.FindModelReferencesAsync(hub, model.ModelType,
//             node.AppNode.Model.Name, model.Name);
//         if (usages != null && usages.Count > 0)
//         {
//             //注意排除自身引用
//             usages = usages.Where(u => !(u.ModelNode.Model.Id  == model.Id)).ToArray();
//             if (usages.Count > 0)
//             {
// #if DEBUG
//                 foreach (var item in usages)
//                 {
//                     Log.Warn(item.ToString());
//                 }
// #endif
//                 throw new Exception("Has usages, Can't delete it.");
//             }
//         }

        // 判断当前模型是否已持久化到数据库中
        if (model.PersistentState == PersistentState.Detached)
        {
            await StagedService.DeleteModelAsync(model.Id);
        }
        else
        {
            model.Delete();
            await node.SaveAsync(null);
        }
        // 移除对应节点
        modelRootNode.RemoveModel(node);
        // 删除Roslyn相关
        RemoveRoslynFromModelNode(hub, node);

        return rootNodeHasCheckout ? null : modelRootNode;
    }
    
    private static void RemoveRoslynFromModelNode(DesignHub hub, ModelNode node)
    {
        if (node.RoslynDocumentId != null)
            hub.TypeSystem.RemoveDocument(node.RoslynDocumentId);
        if (node.ExtRoslynDocumentId != null)
            hub.TypeSystem.RemoveDocument(node.ExtRoslynDocumentId);
        if (node.ServiceProjectId != null) //注意：服务模型移除整个虚拟项目
            hub.TypeSystem.RemoveServiceProject(node.ServiceProjectId);
    }
}