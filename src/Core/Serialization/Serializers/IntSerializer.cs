namespace AppBoxCore;

internal sealed class IntSerializer : TypeSerializer
{
    public IntSerializer() : base(PayloadType.Int32, typeof(int), null, true) { }

    public override void Write(IOutputStream bs, object instance)
        => bs.WriteInt((int)instance);

    public override object? Read(IInputStream bs, object? instance)
        => bs.ReadInt();
}