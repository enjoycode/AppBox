using AppBoxClient;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

internal sealed class Commands
{
    public Commands(DesignStore designStore)
    {
        _designStore = designStore;

        NewFolderCommand = () => new NewDialog(_designStore, "Folder").Show();
        NewEntityCommand = () => new NewEntityDialog(_designStore).Show();
        NewServiceCommand = () => new NewDialog(_designStore, "Service").Show();
        NewViewCommand = () => new NewViewDialog(_designStore).Show();
        NewPermissionCommand = () => new NewDialog(_designStore, "Permission").Show();
        CheckoutCommand = Checkout;
        SaveCommand = Save;
        RenameCommand = Rename;
        DeleteCommand = Delete;
        PublishCommand = () => new PublishDialog().Show();
        BuildAppCommand = BuildApp;
        NotImplCommand = () => Notification.Error("暂未实现");
    }

    private readonly DesignStore _designStore;
    public readonly Action NewFolderCommand;
    public readonly Action NewEntityCommand;
    public readonly Action NewServiceCommand;
    public readonly Action NewViewCommand;
    public readonly Action NewPermissionCommand;
    public readonly Action CheckoutCommand;
    public readonly Action SaveCommand;
    public readonly Action RenameCommand;
    public readonly Action DeleteCommand;
    public readonly Action PublishCommand;
    public readonly Action BuildAppCommand;
    public readonly Action NotImplCommand;

    /// <summary>
    /// 签出选择的节点
    /// </summary>
    private async void Checkout()
    {
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null)
        {
            Notification.Error("请先选择待签出节点");
            return;
        }

        //TODO:已签出或被其他人签出处理

        var nodeType = selectedNode.Data.Type;
        if (nodeType != DesignNodeType.ModelNode &&
            nodeType != DesignNodeType.ModelRootNode &&
            nodeType != DesignNodeType.DataStoreNode)
        {
            Notification.Error("无法签出该类型节点");
            return;
        }

        try
        {
            await CheckoutNode.Execute(selectedNode.Data);
            //TODO:判断返回结果刷新
            Notification.Success($"签出节点[{selectedNode.Data.Label}]成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"签出节点[{selectedNode.Data.Label}]失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 保存当前的设计器的对象
    /// </summary>
    private async void Save()
    {
        var designer = _designStore.ActiveDesigner;
        if (designer == null) return;
        try
        {
            await designer.SaveAsync();
            Notification.Success("保存成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"保存失败: {ex.Message}");
        }
    }

    private async void Delete()
    {
        //TODO:确认删除
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null)
        {
            Notification.Error("请先选择待删除的节点");
            return;
        }

        var nodeType = selectedNode.Data.Type;
        //TODO:判断能否删除

        try
        {
            var modelRootNodeIdString = await Channel.Invoke<string?>(
                "sys.DesignService.DeleteNode",
                new object?[] { (int)nodeType, selectedNode.Data.Id });
            _designStore.OnDeleteNode(selectedNode, modelRootNodeIdString);
            Notification.Success($"删除节点[{selectedNode.Data.Label}]成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"删除节点[{selectedNode.Data.Label}]失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 重命名选择的节点
    /// </summary>
    private async void Rename()
    {
        var selectedNode = _designStore.TreeController.FirstSelectedNode;
        if (selectedNode == null)
        {
            Notification.Error("请先选择待重命名的节点");
            return;
        }

        ModelReferenceType referenceType;
        ModelNode modelNode;
        if (selectedNode.Data.Type == DesignNodeType.ModelNode)
        {
            modelNode = (ModelNode)selectedNode.Data;
            switch (modelNode.ModelType)
            {
                case ModelType.Entity:
                    referenceType = ModelReferenceType.EntityModel;
                    break;
                case ModelType.Service:
                    referenceType = ModelReferenceType.ServiceModel;
                    break;
                case ModelType.View:
                    referenceType = ModelReferenceType.ViewModel;
                    break;
                default:
                    Notification.Error("不支持重命名的节点");
                    return;
            }
        }
        else
        {
            Notification.Error("不支持重命名的节点");
            return;
        }

        var dlg = new RenameDialog(_designStore, referenceType, modelNode.Label.Value, modelNode.Id,
            modelNode.Label.Value);
        var dlgResult = await dlg.ShowAsync();
        if (dlgResult != DialogResult.OK) return;

        modelNode.Label.Value = dlg.GetNewName();
    }

    /// <summary>
    /// 构建前端应用的程序集
    /// </summary>
    private async void BuildApp()
    {
        try
        {
            await Channel.Invoke("sys.DesignService.BuildApp", new object?[] { true });
            Notification.Success($"构建应用成功");
            //TODO:**暂在这里重新构建动态组件工具箱
            await _designStore.RebuildDynamicToolbox();
        }
        catch (Exception ex)
        {
            Notification.Error($"构建应用失败: {ex.Message}");
        }
    }
}