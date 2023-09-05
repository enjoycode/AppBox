namespace AppBoxCore;

public sealed class DynamicEntity
{
    private readonly Dictionary<string, DynamicProperty> _properties = new();

    public DynamicProperty this[string name]
    {
        get => _properties[name];
        set => _properties[name] = value;
    }
}