namespace AppBoxCore;

/// <summary>
/// 模型标识
/// </summary>
public readonly struct ModelId : IComparable<ModelId>, IEquatable<ModelId>
{
    //| AppId 32bit | Type 8bit | Seq 22bit | Layer 2bit|
    private readonly long _encoded;

    private ModelId(long encoded)
    {
        _encoded = encoded;
    }

    public static ModelId Make(int appId, ModelType type, int seq, ModelLayer layer) =>
        new((long)appId << 32 | (long)type << 24 | (long)seq << 2 | (long)layer);

    public int AppId => (int)((_encoded >> 32) & 0xFFFFFFFF);

    public ModelLayer Layer => (ModelLayer)(_encoded & 3);

    public ModelType Type => (ModelType)((_encoded >> 24) & 0xFF);

    public long Value => _encoded;

    public static implicit operator ModelId(long value) => new(value);

    public static implicit operator ModelId(string value) => new((long)ulong.Parse(value));

    public static implicit operator long(ModelId value) => value._encoded;

    public int CompareTo(ModelId other) => _encoded.CompareTo(other._encoded);

    public override string ToString() => ((ulong)_encoded).ToString();

    public bool Equals(ModelId other) => _encoded == other._encoded;

    public override bool Equals(object? obj) => obj is ModelId other && Equals(other);

    public override int GetHashCode() => _encoded.GetHashCode();
}