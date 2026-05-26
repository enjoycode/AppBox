using System.Diagnostics;

namespace AppBoxCore;

public sealed class ReportModel : ModelBase
{
    internal ReportModel() { }

    public ReportModel(ModelId id, string name) : base(id, name)
    {
        Debug.Assert(id.Type == ModelType.Report);
    }

    public byte SchemaVersion { get; private set; }

    #region ====Serialization====

    public override void WriteTo<TWriter>(ref TWriter ws)
    {
        base.WriteTo(ref ws);

        ws.WriteByte(SchemaVersion);

        ws.WriteFieldEnd(); //保留
    }

    public override void ReadFrom<TReader>(ref TReader rs)
    {
        base.ReadFrom(ref rs);

        SchemaVersion = rs.ReadByte();

        rs.ReadVariant(); //保留
    }

    #endregion
}