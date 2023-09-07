namespace AppBoxCore;

public sealed class DynamicEntity
{
    private readonly Dictionary<string, DynamicField> _properties = new();

    public DynamicField this[string name]
    {
        get => _properties[name];
        set => _properties[name] = value;
    }
}