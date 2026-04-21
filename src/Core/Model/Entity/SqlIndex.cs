namespace AppBoxCore;

public sealed class SqlIndex : DbIndex
{
    internal SqlIndex(EntityModel owner) : base(owner) {}

    public SqlIndex(EntityModel owner, string name, bool unique,
        OrderedField[] fields, short[]? storingFields = null)
        : base(owner, name, unique, fields, storingFields) { }

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);
        
        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        rs.ReadVariant(); //保留
    }
}