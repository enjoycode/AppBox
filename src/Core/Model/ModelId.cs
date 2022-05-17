namespace AppBoxCore;

/// <summary>
/// 模型标识
/// </summary>
public readonly struct ModelId
{
    //| AppId 32bit | Type 8bit | Seq 22bit | Layer 2bit|
    private readonly long _encoded;

    internal long EncodedValue => _encoded;

    internal ModelId(long encoded)
    {
        _encoded = encoded;
    }

    public static ModelId Make(int appId, ModelType type, int seq, ModelLayer layer)
        => new ModelId((long)appId << 32 | (long)type << 24 | (long)seq << 2 | (long)layer);

    public int AppId => (int)((_encoded >> 32) & 0xFFFFFFFF);

    public ModelLayer Layer => (ModelLayer)(_encoded & 3);

    public ModelType Type => (ModelType)((_encoded >> 24) & 0xFF);
    
    public static implicit operator ModelId(long value) => new ModelId(value);

    public override string ToString() => ((ulong)_encoded).ToString();
}