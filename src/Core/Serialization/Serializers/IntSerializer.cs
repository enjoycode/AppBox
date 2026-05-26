namespace AppBoxCore;

internal sealed class IntSerializer : TypeSerializer
{
    public IntSerializer() : base(PayloadType.Int32, typeof(int), null, true) { }

    public override void Write<T>(ref T bs, object instance)
        => bs.WriteInt((int)instance);

    public override object? Read<T>(ref T bs, object? instance)
        => bs.ReadInt();
}