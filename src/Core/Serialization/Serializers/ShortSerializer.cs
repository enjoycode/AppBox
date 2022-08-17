namespace AppBoxCore;

internal sealed class ShortSerializer : TypeSerializer
{
    public ShortSerializer() : base(PayloadType.Int16, typeof(short), null, true) { }

    public override void Write(IOutputStream bs, object instance)
        => bs.WriteShort((short)instance);

    public override object? Read(IInputStream bs, object? instance)
        => bs.ReadShort();
}