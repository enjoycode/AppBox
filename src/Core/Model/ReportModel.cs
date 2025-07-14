using System.Diagnostics;

namespace AppBoxCore;

public sealed class ReportModel : ModelBase
{
    internal ReportModel() { }

    public ReportModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Service);
    }

    public byte SchemaVersion { get; private set; }

    #region ====Serialization====

    public override void WriteTo(IOutputStream ws)
    {
        base.WriteTo(ws);

        ws.WriteByte(SchemaVersion);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom(IInputStream rs)
    {
        base.ReadFrom(rs);

        SchemaVersion = rs.ReadByte();

        rs.ReadVariant(); //保留
    }

    #endregion
}