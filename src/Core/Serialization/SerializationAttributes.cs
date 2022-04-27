namespace AppBoxCore;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct)]
public sealed class BinSerializableAttribute : Attribute { }

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