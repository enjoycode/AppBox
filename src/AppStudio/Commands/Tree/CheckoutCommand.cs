using PixUI;

namespace AppBoxDesign;

internal sealed class CheckoutCommand : DesignCommand
{
    public CheckoutCommand(DesignHub context) : base(context) { }

    public async void Execute()
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
            await Checkout(selectedNode.Data);
            //TODO:判断返回结果刷新
            Notification.Success($"签出节点[{selectedNode.Data.Label}]成功");
        }
        catch (Exception ex)
        {
            Notification.Error($"签出节点[{selectedNode.Data.Label}]失败: {ex.Message}");
        }
    }
    
    /// <summary>
    /// 签出指定的设计节点
    /// </summary>
    /// <returns>
    /// 返回true表示模型已变更，用于前端刷新
    /// </returns>
    private static async ValueTask<bool> Checkout(DesignNode node)
    {
        switch (node.Type)
        {
            case DesignNodeType.ModelNode:
            {
                var modelNode = (ModelNode)node;
                var curVersion = modelNode.Model.Version;
                var checkoutOk = await modelNode.CheckoutAsync();
                if (!checkoutOk)
                    throw new Exception("Can't checkout");
                return curVersion != modelNode.Model.Version;
            }
            case DesignNodeType.ModelRootNode:
            {
                var checkoutOk = await node.CheckoutAsync();
                if (!checkoutOk)
                    throw new Exception("Can't checkout");
                return false; //TODO: 根据根文件夹的版本号判断
            }
            case DesignNodeType.DataStoreNode:
                throw new NotImplementedException("签出存储节点");
            default: throw new Exception($"Can't checkout node with type: {node.Type}");
        }
    }
}