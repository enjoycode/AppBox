using AppBoxCore;

namespace AppBoxDesign;

public abstract class DesignNode : IComparable<DesignNode>, IBinSerializable
{
    public abstract DesignNodeType Type { get; }
    public abstract string Label { get; }

    internal DesignNode? Parent;
    internal virtual CheckoutInfo? CheckoutInfo { get; set; }

    /// <summary>
    /// 用于前端回传时识别是哪个节点
    /// </summary>
    public virtual string Id => Label;

    /// <summary>
    /// 作为签出项时的目标标识
    /// </summary>
    public virtual string CheckoutTargetId => Id;

    public virtual int Version { get; set; }

    /// <summary>
    /// 设计节点是否被当前用户签出
    /// </summary>
    public bool IsCheckoutByMe => CheckoutInfo != null &&
                                  CheckoutInfo.DeveloperOuid ==
                                  RuntimeContext.CurrentSession!.LeafOrgUnitId;

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

    #region ====IComparable====

    public int CompareTo(DesignNode? other)
    {
        //TODO:特殊类型排序
        return Type == other!.Type
            ? string.Compare(Label, other.Label, StringComparison.Ordinal)
            : ((byte)Type).CompareTo((byte)other.Type);
    }

    #endregion

    #region ====IBinSerializable====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteString(Id);
        ws.WriteString(Label);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

    #endregion
}