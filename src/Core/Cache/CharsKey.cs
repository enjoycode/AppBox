namespace AppBoxCore;

public readonly struct CharsKey : IEquatable<CharsKey>
{
    private readonly ReadOnlyMemory<char> _memory;

    public CharsKey(string key)
    {
        _memory = key.AsMemory();
    }

    public CharsKey(ReadOnlyMemory<char> key)
    {
        _memory = key;
    }

    public override int GetHashCode()
    {
        var span = _memory.Span;
        int hash = span[0];
        for (var i = 1; i < span.Length; i++)
        {
            hash = ((hash << 5) + hash) ^ span[i];
        }

        return hash ^ span.Length;
    }

    public bool Equals(CharsKey other)
    {
        return _memory.Length == other._memory.Length &&
               _memory.Span.SequenceEqual(other._memory.Span);
    }

    public static implicit operator CharsKey(string v) => new CharsKey(v);

    public static implicit operator CharsKey(ReadOnlyMemory<char> v) => new CharsKey(v);
}