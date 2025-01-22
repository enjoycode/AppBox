namespace AppBoxDesign;

internal static class CheckoutNode
{
    /// <summary>
    /// 签出指定的设计节点
    /// </summary>
    /// <returns>
    /// 返回true表示模型已变更，用于前端刷新
    /// </returns>
    internal static async ValueTask<bool> Execute(DesignNode node)
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