using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class DeleteCommand : DesignCommand
{
    public DeleteCommand(DesignHub context) : base(context) { }

    public async void Execute()
    {
        var selectedNode = DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null)
        {
            Notification.Error("请先选择待删除的节点");
            return;
        }

        //TODO:判断能否删除
        if (selectedNode.Data is ApplicationNode { Model.Name: Consts.SYS })
        {
            Notification.Error("Can't delete [sys] application.");
            return;
        }

        //确认删除
        var nodeName = selectedNode.Data.Label.Value;
        var confirmResult = await Dialog.ShowConfirmAsync("确认操作", $"确认是否删除[{nodeName}]");
        if (confirmResult != DialogResult.Yes)
            return;

        try
        {
            var modelRootNodeIdString = await DeleteNode(Context, selectedNode.Data);
            DesignStore.OnDeleteNode(selectedNode, modelRootNodeIdString);
            Notification.Success($"删除节点[{selectedNode.Data.Label}]成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"删除节点[{selectedNode.Data.Label}]失败: {ex.Message}");
        }
    }

    private static async ValueTask<string> DeleteNode(DesignHub context, DesignNode deleteNode)
    {
        if (deleteNode is not (ModelNode or ApplicationNode or FolderNode { Children.Count: 0 }))
            throw new Exception("Can not delete it.");

        var rootNode = deleteNode switch
        {
            ModelNode modelNode => await DeleteModelNode(context, modelNode),
            FolderNode folderNode => await DeleteFolderNode(context, folderNode),
            ApplicationNode appNode => await DeleteAppNode(context, appNode),
            _ => throw new NotImplementedException()
        };

        //注意：返回rootNode.ID用于前端重新刷新模型根节点
        return rootNode == null ? string.Empty : rootNode.Id;
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
        // 查找引用项
        var usages = await ReferenceService.FindModelReferencesAsync(hub, node);
        if (usages.Count > 0)
        {
            //注意排除自身引用
            usages = usages.Where(u => u.ModelNode.Model.Id != model.Id).ToList();
            if (usages.Count > 0)
            {
#if DEBUG
                foreach (var item in usages)
                {
                    Log.Warn(item.ToString());
                }
#endif
                throw new Exception("Has usages, Can't delete it.");
            }
        }

        // 判断当前模型是否已持久化到数据库中
        if (model.PersistentState == PersistentState.Detached)
        {
            //TODO: should remove from checkouts
            await hub.StagedService.DeleteModelAsync(model.Id);
        }
        else
        {
            model.Delete();
            await node.SaveAsync(null);
        }

        hub.AddRemovedItem(model);
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

    private static async Task<DesignNode?> DeleteFolderNode(DesignHub hub, FolderNode node)
    {
        //查找ModelRootNode
        var modelRootNode = hub.DesignTree.FindModelRootNode(node.Folder.AppId, node.Folder.TargetModelType)!;
        var rootNodeHasCheckout = modelRootNode.IsCheckoutByMe;
        // 尝试签出根节点
        var rootCheckout = await modelRootNode.CheckoutAsync();
        if (!rootCheckout)
            throw new Exception("Can't checkout node.");
        // 注意：如果自动签出了模型根节点，当前选择的节点需要重新指向，因为Node.Checkout()时已重新加载
        if (!rootNodeHasCheckout)
            node = modelRootNode.FindFolderNode(node.Folder.Id) ?? throw new Exception("所选节点已不存在，请刷新");

        var folder = node.Folder;
        if (folder.Parent == null) throw new NotImplementedException();

        folder.Remove();
        await node.SaveAsync();

        //移除对应的节点
        modelRootNode.RemoveFolder(node);

        return rootNodeHasCheckout ? null : modelRootNode;
    }

    private static async Task<DesignNode?> DeleteAppNode(DesignHub hub, ApplicationNode appNode)
    {
        //TODO:*****判断有无其他应用的引用
        //TODO:考虑删除整个应用前自动导出备份

        //先签出所有模型根节点及所有模型节点
        await appNode.CheckoutAllModelRootNodes();
        await appNode.CheckoutAllModelNodes();

        //组包用现有PublishService发布(删除)
        var pkg = new PublishPackage() { DeletedAppId = appNode.Model.Id };
        var apps = hub.GetApplications();
        foreach (var app in apps)
            pkg.Apps.Add(app.Id, app.Name);
        var modelNodes = appNode.GetAllModelNodes();
        foreach (var modelNode in modelNodes)
        {
            if (modelNode.Model.PersistentState != PersistentState.Detached)
            {
                modelNode.Model.Delete();
                pkg.Models.Add(modelNode.Model);
                //不用加入需要删除的相关代码及组件
            }

            //删除所有Roslyn相关
            RemoveRoslynFromModelNode(hub, modelNode);
        }

        //加入待删除的根级文件夹
        var rootFolders = appNode.GetAllRootFolders();
        foreach (var rootFolder in rootFolders)
        {
            rootFolder.IsDeleted = true;
            pkg.Folders.Add(rootFolder);
        }

        //使用PublishService.PublishAsync，与删除ApplicationModel非事务
        await hub.PublishService.PublishAsync(pkg, $"Delete Application: {appNode.Model.Name}");
        //删除ApplicationModel
        await hub.MetaStoreService.DeleteApplicationAsync(appNode.Model); //服务端会删除第三方库
        //从设计树移除ApplicationNode
        hub.DesignTree.AppRootNode.Children.Remove(appNode);
        //移除本地签出列表内相关项
        hub.DesignTree.RemoveCheckoutsForDeletedApp(appNode.Model.Id);
        return null;
    }
}