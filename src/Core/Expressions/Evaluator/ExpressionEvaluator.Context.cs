namespace AppBoxCore;

partial class ExpressionEvaluator
{
    public ExpressionEvaluator(IExpressionContext expressionContext)
    {
        _expressionContext = expressionContext;
    }

    private readonly IExpressionContext _expressionContext;
    private readonly List<BlockStack> _blockStacks = [];

    public void PushBlockStack(BlockStack blockStack) => _blockStacks.Add(blockStack);
    public void PopBlockStack() => _blockStacks.RemoveAt(_blockStacks.Count - 1);

    public AnyValue GetIdentifier(string name, bool isThis = false)
    {
        for (var i = _blockStacks.Count - 1; i >= 0; i--)
        {
            if (_blockStacks[i].TryGetIdentifier(name, out var value))
                return value;
        }

        throw new KeyNotFoundException(name);
    }

    public void SetIdentifier(string name, AnyValue value, bool isThis = false)
    {
        for (var i = _blockStacks.Count - 1; i >= 0; i--)
        {
            if (_blockStacks[i].TrySetIdentifier(name, value))
                return;
        }

        throw new KeyNotFoundException(name);
    }

    public void AddIdentifier(string name, AnyValue value)
        => _blockStacks[^1].AddIdentifier(name, value);

    public AnyValue ResolveParameter(string name) => _expressionContext.ResolveParameter(name);

    public Type ResolveType(ExpressionTypeInfo typeInfo) => _expressionContext.ResolveType(typeInfo);
}