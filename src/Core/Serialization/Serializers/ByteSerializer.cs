namespace AppBoxCore;

internal sealed class ByteSerializer : TypeSerializer
{
    public ByteSerializer() : base(PayloadType.Byte, typeof(byte), null, true) { }

    public override void Write(IOutputStream bs, object instance)
        => bs.WriteByte((byte)instance);

    public override object? Read(IInputStream bs, object? instance)
        => bs.ReadByte();
}