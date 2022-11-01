namespace AppBoxCore;

internal sealed class GuidSerializer : TypeSerializer
{

    public GuidSerializer() : base(PayloadType.Guid, typeof(Guid), null, true) { }

    public override void Write(IOutputStream bs, object instance)
        => bs.WriteGuid((Guid)instance);

    public override object? Read(IInputStream bs, object? instance)
        => bs.ReadGuid();

}
