import * as AppBoxClient from '@/AppBoxClient'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'

export class Commands {
    public static readonly NewEntityCommand: System.Action = () =>
        new AppBoxDesign.NewEntityDialog(PixUI.UIWindow.Current.Overlay).Show();

    public static readonly NewServiceCommand: System.Action = () =>
        new AppBoxDesign.NewDialog(PixUI.UIWindow.Current.Overlay, "Service").Show();

    public static readonly NewViewCommand: System.Action = () =>
        new AppBoxDesign.NewDialog(PixUI.UIWindow.Current.Overlay, "View").Show();

    public static readonly CheckoutCommand: System.Action = Commands.Checkout;

    public static readonly SaveCommand: System.Action = Commands.Save;

    public static readonly DeleteCommand: System.Action = Commands.Delete;

    public static readonly PublishCommand: System.Action = () =>
        new AppBoxDesign.PublishDialog(PixUI.UIWindow.Current.Overlay).Show();

    public static readonly NotImplCommand: System.Action = () => PixUI.Notification.Error("暂未实现");

    private static async Checkout() {
        let selectedNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) {
            PixUI.Notification.Error("请先选择待签出节点");
            return;
        }

        //TODO:已签出或被其他人签出处理

        let nodeType = selectedNode.Data.Type;
        if (nodeType != AppBoxDesign.DesignNodeType.ModelNode &&
            nodeType != AppBoxDesign.DesignNodeType.ModelRootNode &&
            nodeType != AppBoxDesign.DesignNodeType.DataStoreNode) {
            PixUI.Notification.Error("无法签出该类型节点");
            return;
        }

        try {
            await AppBoxClient.Channel.Invoke("sys.DesignService.CheckoutNode", [(Math.floor(nodeType) & 0xFFFFFFFF), selectedNode.Data.Id]);
            //TODO:判断返回结果刷新
            PixUI.Notification.Success(`签出节点[${selectedNode.Data.Label}]成功`);
        } catch (e: any) {
            PixUI.Notification.Success(`签出节点[${selectedNode.Data.Label}]失败`);
        }
    }

    private static async Save() {
        let selectedIndex = AppBoxDesign.DesignStore.DesignerController.SelectedIndex;
        if (selectedIndex < 0)
            return;

        let designer = AppBoxDesign.DesignStore.DesignerController.GetAt(selectedIndex).Designer!;
        try {
            await designer.SaveAsync();
            PixUI.Notification.Success("保存成功");
        } catch (e: any) {
            PixUI.Notification.Error("保存失败");
        }
    }

    private static async Delete() {
        //TODO:确认删除
        let selectedNode = AppBoxDesign.DesignStore.TreeController.FirstSelectedNode;
        if (selectedNode == null) {
            PixUI.Notification.Error("请先选择待删除的节点");
            return;
        }

        let nodeType = selectedNode.Data.Type;
        //TODO:判断能否删除

        try {
            let modelRootNodeIdString = await AppBoxClient.Channel.Invoke<Nullable<string>>(
                "sys.DesignService.DeleteNode", [(Math.floor(nodeType) & 0xFFFFFFFF), selectedNode.Data.Id]);
            AppBoxDesign.DesignStore.OnDeleteNode(selectedNode, modelRootNodeIdString);
            PixUI.Notification.Success(`删除节点[${selectedNode.Data.Label}]成功`);
        } catch (e: any) {
            PixUI.Notification.Success(`删除节点[${selectedNode.Data.Label}]失败`);
        }
    }
}
