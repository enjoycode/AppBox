namespace AppBoxCore;

public sealed class SqlIndexModel : IndexModelBase
{
    internal SqlIndexModel(EntityModel owner) : base(owner) {}

    public SqlIndexModel(EntityModel owner, string name, bool unique,
        FieldWithOrder[] fields, short[]? storingFields = null)
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