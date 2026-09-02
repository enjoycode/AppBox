namespace AppBoxCore;

internal sealed class DoubleSerializer : TypeSerializer
{
    public DoubleSerializer() : base(PayloadType.Double, typeof(double)) { }

    public override void Write<T>(ref T bs, object instance)
    {
        bs.WriteDouble((double)instance);
    }

    public override object? Read<T>(ref T bs, object? instance)
    {
        return bs.ReadDouble();
    }
}