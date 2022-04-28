using AppBoxCore;

namespace AppBoxDesign;

public abstract class DesignNode : IComparable<DesignNode>, IDesignNode, IBinSerializable
{
    public abstract DesignNodeType Type { get; }
    public abstract string Label { get; }

    internal DesignNode? Parent;
    public virtual IList<IDesignNode>? Children => null;

    /// <summary>
    /// 用于前端回传时识别是哪个节点
    /// </summary>
    public virtual string Id => Label;

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
        ws.WriteByte((byte)Type);
        ws.WriteString(Label);
    }

    public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

    #endregion
}