namespace AppBoxCore;

/// <summary>
/// 扩展的已知类型标识
/// </summary>
public readonly struct ExtKnownTypeId : IEquatable<ExtKnownTypeId>
{
    public ExtKnownTypeId()
    {
        _id = 0;
    }

    public ExtKnownTypeId(ushort id)
    {
        if (id == 0) throw new ArgumentException(nameof(id), $"{nameof(id)} cannot be zero.");
        _id = id;
    }

    private readonly ushort _id;

    public bool IsEmpty => _id == 0;
    public static readonly ExtKnownTypeId Empty = new();

    public static implicit operator ExtKnownTypeId(ushort v) => new(v);
    public static implicit operator ushort(ExtKnownTypeId v) => v._id;

    public bool Equals(ExtKnownTypeId other) => _id == other._id;

    public override bool Equals(object? obj) => obj is ExtKnownTypeId other && Equals(other);

    public override int GetHashCode() => _id.GetHashCode();
}