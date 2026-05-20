namespace AppBoxCore;

public sealed class BlockStack
{
    private readonly Dictionary<string, AnyValue> _identifiers = [];
    public bool IsBreak { get; private set; }
    public bool IsContinue { get; private set; }
    public bool IsReturn { get; private set; }
    public AnyValue ReturnValue { get; private set; }

    public AnyValue GetIdentifier(string name) => _identifiers.TryGetValue(name, out var value)
        ? value
        : throw new Exception($"Identifier {name} not found");

    public void SetIdentifier(string name, AnyValue value) => _identifiers[name] = value;
}