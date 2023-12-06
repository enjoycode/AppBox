namespace AppBoxCore;

internal sealed class DateTimeSerializer : TypeSerializer
{
    public DateTimeSerializer() : base(PayloadType.DateTime, typeof(DateTime), null, true) { }

    public override void Write(IOutputStream bs, object instance)
        => bs.WriteDateTime((DateTime)instance);

    public override object? Read(IInputStream bs, object? instance)
        => bs.ReadDateTime();
}