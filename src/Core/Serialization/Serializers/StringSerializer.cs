namespace AppBoxCore;

internal sealed class StringSerializer : TypeSerializer
{
    public StringSerializer() : base(PayloadType.String, typeof(string), null, true) { }

    public override void Write<T>(ref T bs, object instance)
        => bs.WriteString((string)instance);

    public override object? Read<T>(ref T bs, object? instance)
        => bs.ReadString();
}