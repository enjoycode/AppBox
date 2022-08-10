using System;
using AppBoxClient;
using PixUI;

namespace AppBoxDesign
{
    public static class Commands
    {
        public static readonly Action NewEntityCommand = () =>
            new NewEntityDialog(UIWindow.Current.Overlay).Show();

        public static readonly Action NewServiceCommand = () =>
            new NewDialog(UIWindow.Current.Overlay, "Service").Show();

        public static readonly Action NewViewCommand = () =>
            new NewDialog(UIWindow.Current.Overlay, "View").Show();

        public static readonly Action CheckoutCommand = Checkout;

        public static readonly Action SaveCommand = Save;

        public static readonly Action DeleteCommand = Delete;

        public static readonly Action PublishCommand = () =>
            new PublishDialog(UIWindow.Current.Overlay).Show();

        public static readonly Action NotImplCommand = () => Notification.Error("暂未实现");

        /// <summary>
        /// 签出选择的节点
        /// </summary>
        private static async void Checkout()
        {
            var selectedNode = DesignStore.TreeController.FirstSelectedNode;
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
                await Channel.Invoke("sys.DesignService.CheckoutNode", new object?[]
                    { (int)nodeType, selectedNode.Data.Id });
                //TODO:判断返回结果刷新
                Notification.Success($"签出节点[{selectedNode.Data.Label}]成功");
            }
            catch (Exception e)
            {
                Notification.Success($"签出节点[{selectedNode.Data.Label}]失败");
            }
        }

        /// <summary>
        /// 保存当前的设计器的对象
        /// </summary>
        private static async void Save()
        {
            var selectedIndex = DesignStore.DesignerController.SelectedIndex;
            if (selectedIndex < 0)
                return;

            var designer = DesignStore.DesignerController.GetAt(selectedIndex).Designer!;
            try
            {
                await designer.SaveAsync();
                Notification.Success("保存成功");
            }
            catch (Exception e)
            {
                Notification.Error("保存失败");
            }
        }

        private static async void Delete()
        {
            //TODO:确认删除
            var selectedNode = DesignStore.TreeController.FirstSelectedNode;
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
                DesignStore.OnDeleteNode(selectedNode, modelRootNodeIdString);
                Notification.Success($"删除节点[{selectedNode.Data.Label}]成功");
            }
            catch (Exception e)
            {
                Notification.Success($"删除节点[{selectedNode.Data.Label}]失败");
            }
        }
    }
}