namespace AppBoxCore;

internal sealed class FloatSerializer : TypeSerializer
{
    public FloatSerializer() : base(PayloadType.Float, typeof(float)) { }

    public override void Write<T>(ref T bs, object instance)
    {
        bs.WriteFloat((float)instance);
    }

    public override object? Read<T>(ref T bs, object? instance)
    {
        return bs.ReadFloat();
    }
}