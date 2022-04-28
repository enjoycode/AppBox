using AppBoxCore;

namespace AppBoxDesign;

public abstract class DesignNode : IComparable<DesignNode>, IBinSerializable
{
    public abstract DesignNodeType NodeType { get; }
    public abstract string Label { get; }

    internal DesignNode? Parent;

    /// <summary>
    /// 用于前端回传时识别是哪个节点
    /// </summary>
    public virtual string Id => Label;

    #region ====IComparable====

    public int CompareTo(DesignNode? other)
    {
        //TODO:特殊类型排序
        return NodeType == other!.NodeType
            ? string.Compare(Label, other.Label, StringComparison.Ordinal)
            : ((byte)NodeType).CompareTo((byte)other.NodeType);
    }

    #endregion

    #region ====IBinSerializable====

    public virtual void WriteTo(IOutputStream ws)
    {
        ws.WriteString(Id);
        ws.WriteByte((byte)NodeType);
        ws.WriteString(Label);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

    #endregion
}