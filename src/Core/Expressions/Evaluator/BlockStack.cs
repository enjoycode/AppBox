namespace AppBoxCore;

public sealed class BlockStack
{
    private readonly Dictionary<string, AnyValue> _identifiers = [];
    public bool IsBreak { get; private set; }
    public bool IsContinue { get; private set; }
    public bool IsReturn { get; private set; }
    public AnyValue ReturnValue { get; private set; }

    public bool TryGetIdentifier(string name, out AnyValue value) => _identifiers.TryGetValue(name, out value);

    public bool TrySetIdentifier(string name, AnyValue value)
    {
        if (_identifiers.ContainsKey(name))
        {
            _identifiers[name] = value;
            return true;
        }

        return false;
    }

    public void AddIdentifier(string name, AnyValue value) => _identifiers.Add(name, value);
}