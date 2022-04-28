namespace AppBoxCore;

public enum BinSerializePolicy
{
    /// <summary>
    /// 按FieldId-Value对写入
    /// </summary>
    None = 0,

    /// <summary>
    /// 非Nullable按顺序直接写入(不写FieldId)
    /// </summary>
    Compact = 1,

    /// <summary>
    /// 不写入扩展标记(该类型不需要保留扩展)
    /// </summary>
    CompactNoReverse = 2
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct)]
public sealed class BinSerializableAttribute : Attribute
{
    private readonly BinSerializePolicy _policy;

    public BinSerializableAttribute(BinSerializePolicy policy = BinSerializePolicy.None)
    {
        _policy = policy;
    }
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class FieldAttribute : Attribute
{
    private readonly int _fieldId;
    private readonly bool _asVariant;

    public FieldAttribute(int fieldId, bool asVariant = false)
    {
        _fieldId = fieldId;
        _asVariant = asVariant;
    }
}