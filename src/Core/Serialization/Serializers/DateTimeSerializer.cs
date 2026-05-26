namespace AppBoxCore;

internal sealed class DateTimeSerializer : TypeSerializer
{
    public DateTimeSerializer() : base(PayloadType.DateTime, typeof(DateTime), null, true) { }

    public override void Write<T>(ref T bs, object instance)
        => bs.WriteDateTime((DateTime)instance);

    public override object? Read<T>(ref T bs, object? instance)
        => bs.ReadDateTime();
}