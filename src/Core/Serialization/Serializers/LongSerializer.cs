namespace AppBoxCore;

internal sealed class LongSerializer : TypeSerializer
{
    public LongSerializer() : base(PayloadType.Int64, typeof(long), null, true) { }

    public override void Write<T>(ref T bs, object instance)
        => bs.WriteLong((long)instance);

    public override object? Read<T>(ref T bs, object? instance)
        => bs.ReadLong();
}