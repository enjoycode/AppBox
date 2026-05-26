namespace AppBoxCore;

public sealed class SqlIndex : DbIndex
{
    internal SqlIndex(EntityModel owner) : base(owner) { }

    public SqlIndex(EntityModel owner, string name, bool unique,
        OrderedField[] fields, short[]? storingFields = null)
        : base(owner, name, unique, fields, storingFields) { }

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        rs.ReadVariant(); //保留
    }
}