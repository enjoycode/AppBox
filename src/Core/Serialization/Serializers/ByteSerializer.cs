namespace AppBoxCore;

internal sealed class ByteSerializer : TypeSerializer
{
    public ByteSerializer() : base(PayloadType.Byte, typeof(byte), null, true) { }

    public override void Write<T>(ref T bs, object instance)
        => bs.WriteByte((byte)instance);

    public override object? Read<T>(ref T bs, object? instance)
        => bs.ReadByte();
}