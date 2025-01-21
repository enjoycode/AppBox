using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AppBoxCore;
using PixUI;

namespace AppBoxDesign;

public abstract class DesignNode : IComparable<DesignNode>
{
    public abstract DesignNodeType Type { get; }
    public abstract State<string> Label { get; }
    
    /// <summary>
    /// 当前节点打开的设计器，打开时设置关闭时取消
    /// </summary>
    internal IDesigner? Designer { get; set; }

    internal DesignNode? Parent;
    internal virtual CheckoutInfo? CheckoutInfo { get; set; }

    /// <summary>
    /// 用于前端回传时识别是哪个节点
    /// </summary>
    public virtual string Id => Label.Value;

    /// <summary>
    /// 作为签出项时的目标标识
    /// </summary>
    public virtual string CheckoutTargetId => Id;

    public virtual int Version { get; set; }

    protected DesignNode RootNode
    {
        get
        {
            var cur = this;
            while (cur.Parent != null)
            {
                cur = cur.Parent;
            }

            return cur;
        }
    }

    public DesignTree? DesignTree
    {
        get
        {
            if (RootNode is IRootNode rootNode)
                return rootNode.DesignTree;
            return null;
        }
    }

    #region ====Checkout====

    /// <summary>
    /// 设计节点是否被当前用户签出
    /// </summary>
    public bool IsCheckoutByMe => CheckoutInfo != null &&
                                  CheckoutInfo.DeveloperOuid ==
                                  RuntimeContext.CurrentSession!.LeafOrgUnitId;

    public bool AllowCheckout => Type is DesignNodeType.ModelRootNode
        or DesignNodeType.ModelNode or DesignNodeType.DataStoreNode;

    /// <summary>
    /// 签出当前节点
    /// </summary>
    public async Task<bool> CheckoutAsync()
    {
        throw new NotImplementedException("签出节点");
        // //判断是否已签出或者能否签出
        // if (!AllowCheckout) return false;
        // if (IsCheckoutByMe) return true;
        //
        // //调用服务
        // var session = DesignTree!.DesignHub.Session;
        // var infos = new List<CheckoutInfo>()
        // {
        //     new(Type, CheckoutTargetId, Version, session.Name, session.LeafOrgUnitId)
        // };
        // var res = await CheckoutService.CheckoutAsync(infos);
        // if (res.Success)
        // {
        //     //签出成功则将请求的签出信息添加至当前的已签出列表
        //     DesignTree.AddCheckoutInfos(infos);
        //     //如果签出的是单个模型，且具备更新的版本，则替换旧模型
        //     if (Type == DesignNodeType.ModelNode && res.ModelWithNewVersion != null)
        //     {
        //         var modelNode = (ModelNode)this;
        //         modelNode.Model = res.ModelWithNewVersion;
        //         //更新为新模型的虚拟代码
        //         await DesignTree.DesignHub.TypeSystem.UpdateModelDocumentAsync(modelNode);
        //     }
        //
        //     //更新当前节点的签出信息
        //     CheckoutInfo = infos[0];
        // }
        //
        // return res.Success;
    }

    #endregion

    #region ====IComparable====

    public int CompareTo(DesignNode? other)
    {
        //TODO:特殊类型排序
        return Type == other!.Type
            ? string.Compare(Label.Value, other.Label.Value, StringComparison.Ordinal)
            : ((byte)Type).CompareTo((byte)other.Type);
    }

    #endregion
}